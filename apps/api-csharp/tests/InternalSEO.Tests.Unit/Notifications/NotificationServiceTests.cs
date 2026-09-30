using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace InternalSEO.Tests.Unit.Notifications;

public class NotificationServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _service;
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _user1Id = Guid.NewGuid();
    private readonly Guid _user2Id = Guid.NewGuid();

    public NotificationServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _service = new NotificationService(_context, NullLogger<NotificationService>.Instance);

        // Seed Project & Members
        var project = new Project
        {
            Id = _projectId,
            Name = "Acme Corp",
            PrimaryDomain = "acme.com",
            CreatedBy = _user1Id
        };
        _context.Projects.Add(project);

        _context.ProjectMembers.AddRange(
            new ProjectMember { Id = Guid.NewGuid(), ProjectId = _projectId, UserId = _user1Id, AccessLevel = ProjectAccessLevel.Owner },
            new ProjectMember { Id = Guid.NewGuid(), ProjectId = _projectId, UserId = _user2Id, AccessLevel = ProjectAccessLevel.Member }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateDirectNotification_CreatesNotificationSuccessfully()
    {
        var result = await _service.CreateDirectNotificationAsync(
            _projectId,
            _user1Id,
            "Task Assigned",
            "You have been assigned to task 1",
            "Info",
            "TaskAssigned",
            $"/projects/{_projectId}/tasks/task-1");

        result.Should().BeTrue();

        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.UserId == _user1Id);
        notification.Should().NotBeNull();
        notification!.Title.Should().Be("Task Assigned");
        notification.Severity.Should().Be("Info");
        notification.EventType.Should().Be("TaskAssigned");
        notification.IsRead.Should().BeFalse();
        notification.TargetUrl.Should().Be($"/projects/{_projectId}/tasks/task-1");
    }

    [Fact]
    public async Task CreateDirectNotification_SuppressesDuplicate_Within24Hours()
    {
        var targetUrl = $"/projects/{_projectId}/tasks/task-dup-1";

        // First creation succeeds
        var first = await _service.CreateDirectNotificationAsync(
            _projectId, _user1Id, "Task Assigned", "Msg", "Info", "TaskAssigned", targetUrl);
        first.Should().BeTrue();

        // Second creation within 24h is suppressed
        var second = await _service.CreateDirectNotificationAsync(
            _projectId, _user1Id, "Task Assigned", "Msg", "Info", "TaskAssigned", targetUrl);
        second.Should().BeFalse();

        var count = await _context.Notifications.CountAsync(n => n.TargetUrl == targetUrl);
        count.Should().Be(1);
    }

    [Fact]
    public async Task CreateDirectNotification_AllowsDifferentEntities_WithoutSuppression()
    {
        var targetUrl1 = $"/projects/{_projectId}/tasks/task-A";
        var targetUrl2 = $"/projects/{_projectId}/tasks/task-B";

        var first = await _service.CreateDirectNotificationAsync(
            _projectId, _user1Id, "Task Assigned", "Msg A", "Info", "TaskAssigned", targetUrl1);
        var second = await _service.CreateDirectNotificationAsync(
            _projectId, _user1Id, "Task Assigned", "Msg B", "Info", "TaskAssigned", targetUrl2);

        first.Should().BeTrue();
        second.Should().BeTrue();
    }

    [Fact]
    public async Task CreateProjectBroadcast_MaterializesRows_PerProjectMember()
    {
        var targetUrl = $"/projects/{_projectId}/audit?runId=run-1";

        var createdCount = await _service.CreateProjectBroadcastAsync(
            _projectId,
            "Crawl Failed",
            "Crawl failed for domain",
            "Critical",
            "CrawlFailed",
            targetUrl);

        createdCount.Should().Be(2);

        var notifications = await _context.Notifications.Where(n => n.ProjectId == _projectId).ToListAsync();
        notifications.Should().HaveCount(2);
        notifications.Select(n => n.UserId).Should().Contain(new[] { (Guid?)_user1Id, (Guid?)_user2Id });
        notifications.All(n => n.EventType == "CrawlFailed").Should().BeTrue();
        notifications.All(n => !n.IsRead).Should().BeTrue();
    }

    [Fact]
    public async Task CreateProjectBroadcast_SuppressesDuplicate_Within24Hours()
    {
        var targetUrl = $"/projects/{_projectId}/audit?runId=run-2";

        var first = await _service.CreateProjectBroadcastAsync(
            _projectId, "Crawl Failed", "Msg", "Critical", "CrawlFailed", targetUrl);
        first.Should().Be(2);

        var second = await _service.CreateProjectBroadcastAsync(
            _projectId, "Crawl Failed", "Msg", "Critical", "CrawlFailed", targetUrl);
        second.Should().Be(0); // All members suppressed
    }
}
