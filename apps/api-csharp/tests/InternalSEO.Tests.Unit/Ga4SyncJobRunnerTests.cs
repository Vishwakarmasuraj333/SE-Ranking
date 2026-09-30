using FluentAssertions;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class Ga4SyncJobRunnerTests
{
    private readonly ApplicationDbContext _context;
    private readonly DataProtectionTokenEncryptionService _encryptionService;
    private readonly MockGoogleAnalyticsClient _mockGa4Client;
    private readonly MockGoogleSearchConsoleClient _mockGoogleAuth;
    private readonly Ga4SyncJobRunner _runner;

    public Ga4SyncJobRunnerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"Ga4SyncDb_{Guid.NewGuid():N}")
            .Options;

        _context = new ApplicationDbContext(options);

        var services = new ServiceCollection();
        services.AddDataProtection();
        var sp = services.BuildServiceProvider();
        _encryptionService = new DataProtectionTokenEncryptionService(sp.GetRequiredService<IDataProtectionProvider>());

        _mockGa4Client = new MockGoogleAnalyticsClient(NullLogger<MockGoogleAnalyticsClient>.Instance);
        _mockGoogleAuth = new MockGoogleSearchConsoleClient(NullLogger<MockGoogleSearchConsoleClient>.Instance);

        _runner = new Ga4SyncJobRunner(
            _context,
            _encryptionService,
            _mockGoogleAuth,
            _mockGa4Client,
            NullLogger<Ga4SyncJobRunner>.Instance
        );
    }

    [Fact]
    public async Task ExecuteSyncAsync_WithValidConnection_IngestsDailyAndLandingPageMetrics()
    {
        var projectId = Guid.NewGuid();
        var encryptedToken = _encryptionService.Encrypt("valid_refresh_token_123");

        var connection = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            ServiceType = GoogleConstants.ServiceTypes.Ga4,
            PropertyIdentifier = "properties/123456789",
            AccountEmail = "admin@example.com",
            EncryptedRefreshToken = encryptedToken,
            SyncStatus = GoogleConstants.SyncStatuses.Active
        };
        _context.GoogleConnections.Add(connection);
        await _context.SaveChangesAsync();

        var result = await _runner.ExecuteSyncAsync(projectId);

        result.Success.Should().BeTrue();
        result.DaysProcessed.Should().Be(3);
        result.TotalDailyRecords.Should().BeGreaterThan(0);
        result.TotalLandingPageRecords.Should().BeGreaterThan(0);

        var dailyRows = await _context.Ga4DailyMetrics.Where(d => d.ProjectId == projectId).ToListAsync();
        dailyRows.Should().NotBeEmpty();

        var pageRows = await _context.Ga4LandingPageMetrics.Where(p => p.ProjectId == projectId).ToListAsync();
        pageRows.Should().NotBeEmpty();

        var updatedConn = await _context.GoogleConnections.FirstAsync(c => c.Id == connection.Id);
        updatedConn.LastSyncedAt.Should().NotBeNull();
        updatedConn.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Active);
        updatedConn.LastErrorMessage.Should().BeNull();
    }

    [Fact]
    public async Task ExecuteSyncAsync_RunTwice_IsIdempotentAndDoesNotDuplicateRecords()
    {
        var projectId = Guid.NewGuid();
        var encryptedToken = _encryptionService.Encrypt("valid_refresh_token_123");

        var connection = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            ServiceType = GoogleConstants.ServiceTypes.Ga4,
            PropertyIdentifier = "properties/123456789",
            AccountEmail = "admin@example.com",
            EncryptedRefreshToken = encryptedToken,
            SyncStatus = GoogleConstants.SyncStatuses.Active
        };
        _context.GoogleConnections.Add(connection);
        await _context.SaveChangesAsync();

        // Run 1
        var result1 = await _runner.ExecuteSyncAsync(projectId);
        result1.Success.Should().BeTrue();

        var initialDailyCount = await _context.Ga4DailyMetrics.CountAsync(d => d.ProjectId == projectId);
        var initialPageCount = await _context.Ga4LandingPageMetrics.CountAsync(p => p.ProjectId == projectId);

        // Run 2
        var result2 = await _runner.ExecuteSyncAsync(projectId);
        result2.Success.Should().BeTrue();

        var secondDailyCount = await _context.Ga4DailyMetrics.CountAsync(d => d.ProjectId == projectId);
        var secondPageCount = await _context.Ga4LandingPageMetrics.CountAsync(p => p.ProjectId == projectId);

        secondDailyCount.Should().Be(initialDailyCount);
        secondPageCount.Should().Be(initialPageCount);
    }
}
