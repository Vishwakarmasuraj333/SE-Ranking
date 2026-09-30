using System.Net;
using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Notifications;

public class TriggerConditionsTests
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _assigneeId = Guid.NewGuid();

    public TriggerConditionsTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _notificationService = new NotificationService(_context, NullLogger<NotificationService>.Instance);

        var project = new Project
        {
            Id = _projectId,
            Name = "Trigger Test Project",
            PrimaryDomain = "trigger.com",
            CreatedBy = _assigneeId
        };
        _context.Projects.Add(project);

        _context.ProjectMembers.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            UserId = _assigneeId,
            AccessLevel = ProjectAccessLevel.Owner
        });

        _context.SaveChanges();
    }

    [Fact]
    public async Task TaskOverdueScanner_DetectsOverdueTask_AndEmitsNotification()
    {
        var todayUtc = DateOnly.FromDateTime(DateTime.UtcNow);

        // Overdue task
        var overdueTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Overdue Audit Fix",
            Status = "Open",
            DueDate = todayUtc.AddDays(-2),
            AssigneeId = _assigneeId,
            CreatedBy = _assigneeId
        };

        // Future task (not overdue)
        var futureTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Future Task",
            Status = "Open",
            DueDate = todayUtc.AddDays(5),
            AssigneeId = _assigneeId,
            CreatedBy = _assigneeId
        };

        // Verified task (should be excluded even if past due)
        var verifiedTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Verified Task",
            Status = "Verified",
            DueDate = todayUtc.AddDays(-5),
            AssigneeId = _assigneeId,
            CreatedBy = _assigneeId
        };

        // Closed task (should be excluded)
        var closedTask = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Closed Task",
            Status = "Closed",
            DueDate = todayUtc.AddDays(-5),
            AssigneeId = _assigneeId,
            CreatedBy = _assigneeId
        };

        _context.Tasks.AddRange(overdueTask, futureTask, verifiedTask, closedTask);
        await _context.SaveChangesAsync();

        var scanner = new TaskOverdueScanner(_context, _notificationService, NullLogger<TaskOverdueScanner>.Instance);
        var emitted = await scanner.ScanAndNotifyOverdueTasksAsync();

        emitted.Should().Be(1);

        var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.EventType == "TaskOverdue");
        notif.Should().NotBeNull();
        notif!.UserId.Should().Be(_assigneeId);
        notif.TargetUrl.Should().Be($"/projects/{_projectId}/tasks/{overdueTask.Id}");
        notif.Severity.Should().Be("Warning");
    }

    [Fact]
    public async Task KeywordDrop_TriggersOnlyForTop10Keywords_DroppingGreaterThan5Positions()
    {
        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = _projectId, KeywordText = "enterprise seo tool", CreatedBy = _assigneeId, IsActive = true };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = _projectId, KeywordText = "rank tracker", CreatedBy = _assigneeId, IsActive = true };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = _projectId, KeywordText = "keyword research", CreatedBy = _assigneeId, IsActive = true };
        _context.Keywords.AddRange(kw1, kw2, kw3);
        await _context.SaveChangesAsync();

        var mockProvider = new Mock<IRankTrackingProvider>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // kw1: was rank 4 (Top 10), dropped to rank 11 -> change = -7 (Drop > 5 positions) -> QUALIFIES
        // kw2: was rank 4 (Top 10), dropped to rank 8 -> change = -4 (Drop <= 5 positions) -> DOES NOT QUALIFY
        // kw3: was rank 22 (Not Top 10), dropped to rank 30 -> change = -8 -> DOES NOT QUALIFY
        var observations = new List<RankObservation>
        {
            new(kw1.Id, _projectId, today, 11, 4, -7, "https://trigger.com", true, false, null, "test"),
            new(kw2.Id, _projectId, today, 8, 4, -4, "https://trigger.com", true, false, null, "test"),
            new(kw3.Id, _projectId, today, 30, 22, -8, "https://trigger.com", true, false, null, "test")
        };

        mockProvider.Setup(p => p.GetObservationsAsync(_projectId, It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(observations);

        var runner = new RankTrackingJobRunner(
            _context,
            mockProvider.Object,
            _notificationService,
            new Mock<IActivityLogger>().Object,
            NullLogger<RankTrackingJobRunner>.Instance);

        var processed = await runner.ExecuteRankTrackingAsync(_projectId);
        processed.Should().Be(3);

        var notifs = await _context.Notifications.Where(n => n.EventType == "KeywordDrop").ToListAsync();
        notifs.Should().HaveCount(1);
        notifs.First().TargetUrl.Should().Be($"/projects/{_projectId}/rankings?keywordId={kw1.Id}");
        notifs.First().Severity.Should().Be("Critical");
    }

    [Theory]
    [InlineData("invalid_grant", HttpStatusCode.BadRequest, true, true)]
    [InlineData("unauthorized_client", HttpStatusCode.BadRequest, true, true)]
    [InlineData("invalid_client", HttpStatusCode.BadRequest, true, true)]
    [InlineData(null, HttpStatusCode.Unauthorized, true, true)]
    public async Task GscSync_StructuredOAuthFailure_EmitsSyncFailed(string? errorCode, HttpStatusCode statusCode, bool isAuthFailure, bool expectedTrigger)
    {
        var testProjId = Guid.NewGuid();
        var encMock = new Mock<ITokenEncryptionService>();
        encMock.Setup(e => e.Decrypt(It.IsAny<string>())).Returns("valid_refresh_token");

        var conn = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = testProjId,
            ServiceType = "GSC",
            PropertyIdentifier = "sc-domain:test.com",
            EncryptedRefreshToken = "encrypted",
            SyncStatus = "Active"
        };
        _context.GoogleConnections.Add(conn);
        _context.Projects.Add(new Project { Id = testProjId, Name = "GSC Test", PrimaryDomain = "test.com", CreatedBy = _assigneeId });
        _context.ProjectMembers.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = testProjId, UserId = _assigneeId, AccessLevel = ProjectAccessLevel.Owner });
        await _context.SaveChangesAsync();

        var authMock = new Mock<IGoogleAuthService>();
        authMock.Setup(a => a.RefreshAccessTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new GoogleOAuthException("OAuth failure", statusCode, errorCode, isAuthFailure));

        var gscClientMock = new Mock<IGoogleSearchConsoleClient>();

        var runner = new GscSyncJobRunner(
            _context,
            encMock.Object,
            authMock.Object,
            gscClientMock.Object,
            _notificationService,
            NullLogger<GscSyncJobRunner>.Instance);

        var result = await runner.ExecuteSyncAsync(testProjId);
        result.Success.Should().BeFalse();

        var notifs = await _context.Notifications.Where(n => n.ProjectId == testProjId && n.EventType == "SyncFailed").ToListAsync();
        if (expectedTrigger)
        {
            notifs.Should().HaveCount(1);
            notifs.First().Severity.Should().Be("Critical");
            notifs.First().TargetUrl.Should().Be($"/projects/{testProjId}/settings/integrations/gsc");
        }
        else
        {
            notifs.Should().BeEmpty();
        }
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized, true, true)]
    [InlineData(HttpStatusCode.Forbidden, true, true)]
    [InlineData(HttpStatusCode.InternalServerError, false, false)]
    [InlineData(HttpStatusCode.ServiceUnavailable, false, false)]
    public async Task GscSync_ApiStatusCodes_ClassifiedCorrectly(HttpStatusCode statusCode, bool isAuthFailure, bool expectedTrigger)
    {
        var testProjId = Guid.NewGuid();
        var encMock = new Mock<ITokenEncryptionService>();
        encMock.Setup(e => e.Decrypt(It.IsAny<string>())).Returns("valid_refresh_token");

        var conn = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = testProjId,
            ServiceType = "GSC",
            PropertyIdentifier = "sc-domain:status-test.com",
            EncryptedRefreshToken = "encrypted",
            SyncStatus = "Active"
        };
        _context.GoogleConnections.Add(conn);
        _context.Projects.Add(new Project { Id = testProjId, Name = "Status Test", PrimaryDomain = "statustest.com", CreatedBy = _assigneeId });
        _context.ProjectMembers.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = testProjId, UserId = _assigneeId, AccessLevel = ProjectAccessLevel.Owner });
        await _context.SaveChangesAsync();

        var authMock = new Mock<IGoogleAuthService>();
        authMock.Setup(a => a.RefreshAccessTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GoogleTokenRefreshResult("valid_access_token", 3600));

        var gscClientMock = new Mock<IGoogleSearchConsoleClient>();
        gscClientMock.Setup(c => c.FetchPerformanceDataAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GscFetchDataResult(
                false,
                $"GSC error: {statusCode}",
                Array.Empty<GscDailyMetricRecord>(),
                Array.Empty<GscQueryMetricRecord>(),
                statusCode,
                isAuthFailure));

        var runner = new GscSyncJobRunner(
            _context,
            encMock.Object,
            authMock.Object,
            gscClientMock.Object,
            _notificationService,
            NullLogger<GscSyncJobRunner>.Instance);

        var result = await runner.ExecuteSyncAsync(testProjId);
        result.Success.Should().BeFalse();

        var notifs = await _context.Notifications.Where(n => n.ProjectId == testProjId && n.EventType == "SyncFailed").ToListAsync();
        if (expectedTrigger)
        {
            notifs.Should().HaveCount(1);
            notifs.First().Severity.Should().Be("Critical");
            notifs.First().TargetUrl.Should().Be($"/projects/{testProjId}/settings/integrations/gsc");
        }
        else
        {
            notifs.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task GscSync_TransientException_WithMisleadingMessage_NeverEmitsSyncFailed()
    {
        var testProjId = Guid.NewGuid();
        var encMock = new Mock<ITokenEncryptionService>();
        encMock.Setup(e => e.Decrypt(It.IsAny<string>())).Returns("valid_refresh_token");

        var conn = new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = testProjId,
            ServiceType = "GSC",
            PropertyIdentifier = "sc-domain:transient-test.com",
            EncryptedRefreshToken = "encrypted",
            SyncStatus = "Active"
        };
        _context.GoogleConnections.Add(conn);
        _context.Projects.Add(new Project { Id = testProjId, Name = "Transient Test", PrimaryDomain = "transient.com", CreatedBy = _assigneeId });
        _context.ProjectMembers.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = testProjId, UserId = _assigneeId, AccessLevel = ProjectAccessLevel.Owner });
        await _context.SaveChangesAsync();

        var authMock = new Mock<IGoogleAuthService>();
        // Simulate a transient network exception whose message coincidentally contains words like "unauthorized" or "revoked"
        authMock.Setup(a => a.RefreshAccessTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("DNS resolution failed: unauthorized connection proxy timed out and certificate revoked"));

        var gscClientMock = new Mock<IGoogleSearchConsoleClient>();

        var runner = new GscSyncJobRunner(
            _context,
            encMock.Object,
            authMock.Object,
            gscClientMock.Object,
            _notificationService,
            NullLogger<GscSyncJobRunner>.Instance);

        var result = await runner.ExecuteSyncAsync(testProjId);
        result.Success.Should().BeFalse();

        // Must NOT emit SyncFailed because it was not a typed GoogleOAuthException
        var notifs = await _context.Notifications.Where(n => n.ProjectId == testProjId && n.EventType == "SyncFailed").ToListAsync();
        notifs.Should().BeEmpty();
    }
}
