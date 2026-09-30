using FluentAssertions;
using InternalSEO.Application.Common.Models;
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

public class GscSyncJobRunnerTests
{
    private readonly ApplicationDbContext _context;
    private readonly DataProtectionTokenEncryptionService _encryptionService;
    private readonly MockGoogleSearchConsoleClient _mockGoogleClient;
    private readonly GscSyncJobRunner _runner;

    public GscSyncJobRunnerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"GscSyncDb_{Guid.NewGuid():N}")
            .Options;

        _context = new ApplicationDbContext(options);

        var services = new ServiceCollection();
        services.AddDataProtection();
        var sp = services.BuildServiceProvider();
        _encryptionService = new DataProtectionTokenEncryptionService(sp.GetRequiredService<IDataProtectionProvider>());

        _mockGoogleClient = new MockGoogleSearchConsoleClient(NullLogger<MockGoogleSearchConsoleClient>.Instance);

        var notificationService = new NotificationService(_context, NullLogger<NotificationService>.Instance);
        _runner = new GscSyncJobRunner(
            _context,
            _encryptionService,
            _mockGoogleClient,
            _mockGoogleClient,
            notificationService,
            NullLogger<GscSyncJobRunner>.Instance
        );
    }

    [Fact]
    public async Task ExecuteSyncAsync_WithValidConnection_IngestsDailyAndQueryMetrics()
    {
        var projectId = Guid.NewGuid();
        var encryptedToken = _encryptionService.Encrypt("valid_refresh_token_123");

        var connection = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            ServiceType = GoogleConstants.ServiceTypes.Gsc,
            PropertyIdentifier = "sc-domain:example.com",
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
        result.TotalQueryRecords.Should().BeGreaterThan(0);

        var dailyRows = await _context.GscDailyMetrics.Where(d => d.ProjectId == projectId).ToListAsync();
        dailyRows.Should().NotBeEmpty();

        var queryRows = await _context.GscQueryMetrics.Where(q => q.ProjectId == projectId).ToListAsync();
        queryRows.Should().NotBeEmpty();

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
            ServiceType = GoogleConstants.ServiceTypes.Gsc,
            PropertyIdentifier = "sc-domain:example.com",
            AccountEmail = "admin@example.com",
            EncryptedRefreshToken = encryptedToken,
            SyncStatus = GoogleConstants.SyncStatuses.Active
        };
        _context.GoogleConnections.Add(connection);
        await _context.SaveChangesAsync();

        // Run sync 1
        var result1 = await _runner.ExecuteSyncAsync(projectId);
        result1.Success.Should().BeTrue();

        var initialDailyCount = await _context.GscDailyMetrics.CountAsync(d => d.ProjectId == projectId);
        var initialQueryCount = await _context.GscQueryMetrics.CountAsync(q => q.ProjectId == projectId);

        // Run sync 2 (same date window)
        var result2 = await _runner.ExecuteSyncAsync(projectId);
        result2.Success.Should().BeTrue();

        var secondDailyCount = await _context.GscDailyMetrics.CountAsync(d => d.ProjectId == projectId);
        var secondQueryCount = await _context.GscQueryMetrics.CountAsync(q => q.ProjectId == projectId);

        secondDailyCount.Should().Be(initialDailyCount, "Daily metric rows must be updated idempotently without duplicates.");
        secondQueryCount.Should().Be(initialQueryCount, "Query metric rows must be replaced idempotently without duplicates.");
    }

    [Fact]
    public async Task ExecuteSyncAsync_WithRevokedToken_SetsStatusToErrorWithActionableMessage()
    {
        var projectId = Guid.NewGuid();
        var encryptedToken = _encryptionService.Encrypt("revoked_refresh_token_999");

        var connection = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            ServiceType = GoogleConstants.ServiceTypes.Gsc,
            PropertyIdentifier = "sc-domain:example.com",
            AccountEmail = "admin@example.com",
            EncryptedRefreshToken = encryptedToken,
            SyncStatus = GoogleConstants.SyncStatuses.Active
        };
        _context.GoogleConnections.Add(connection);
        await _context.SaveChangesAsync();

        var result = await _runner.ExecuteSyncAsync(projectId);

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("reconnect", Exactly.Once());

        var updatedConn = await _context.GoogleConnections.FirstAsync(c => c.Id == connection.Id);
        updatedConn.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Error);
        updatedConn.LastErrorMessage.Should().Contain("reconnect");
    }
}
