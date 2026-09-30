using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Notifications.Commands.MarkAllRead;
using InternalSEO.Application.Features.Notifications.Commands.MarkRead;
using InternalSEO.Application.Features.Notifications.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Notifications;

public class NotificationQueriesAndCommandsTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Guid _user1Id = Guid.NewGuid();
    private readonly Guid _user2Id = Guid.NewGuid();
    private readonly Guid _project1Id = Guid.NewGuid();
    private readonly Guid _project2Id = Guid.NewGuid();

    public NotificationQueriesAndCommandsTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        _currentUserServiceMock.Setup(u => u.UserId).Returns(_user1Id);
        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.IsSuperAdmin).Returns(false);

        // Seed Projects
        var p1 = new Project { Id = _project1Id, Name = "Alpha Corp", PrimaryDomain = "alpha.com", CreatedBy = _user1Id };
        var p2 = new Project { Id = _project2Id, Name = "Beta Corp", PrimaryDomain = "beta.com", CreatedBy = _user2Id };
        _context.Projects.AddRange(p1, p2);

        // Seed Memberships: user1 is member of project1 only
        _context.ProjectMembers.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = _project1Id, UserId = _user1Id, AccessLevel = Domain.Enums.ProjectAccessLevel.Owner });
        _context.ProjectMembers.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = _project2Id, UserId = _user2Id, AccessLevel = Domain.Enums.ProjectAccessLevel.Owner });

        // Seed Notifications
        _context.Notifications.AddRange(
            new Notification
            {
                Id = 1,
                UserId = _user1Id,
                ProjectId = _project1Id,
                Title = "Task Assigned",
                Message = "Task 1 assigned",
                Severity = "Info",
                EventType = "TaskAssigned",
                TargetUrl = $"/projects/{_project1Id}/tasks/task-1",
                IsRead = false,
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-30)
            },
            new Notification
            {
                Id = 2,
                UserId = _user1Id,
                ProjectId = _project1Id,
                Title = "Crawl Failed",
                Message = "Crawl failed",
                Severity = "Critical",
                EventType = "CrawlFailed",
                TargetUrl = $"/projects/{_project1Id}/audit?runId=run-1",
                IsRead = true,
                ReadAt = DateTimeOffset.UtcNow.AddMinutes(-10),
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-20)
            },
            new Notification
            {
                Id = 3,
                UserId = _user2Id, // User 2's private notification
                ProjectId = _project2Id,
                Title = "User 2 Alert",
                Message = "Private message",
                Severity = "Warning",
                EventType = "TaskAssigned",
                TargetUrl = $"/projects/{_project2Id}/tasks/task-2",
                IsRead = false,
                CreatedAt = DateTimeOffset.UtcNow
            }
        );

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetNotifications_ReturnsOnlyCurrentUsersNotifications()
    {
        var handler = new GetNotificationsQueryHandler(_context, _currentUserServiceMock.Object);
        var query = new GetNotificationsQuery(Page: 1, PageSize: 20);

        var result = await handler.Handle(query, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(2);
        result.Data.Items.All(n => n.UserId == _user1Id).Should().BeTrue();
    }

    [Fact]
    public async Task GetNotifications_UnreadOnlyFilter_WorksCorrectly()
    {
        var handler = new GetNotificationsQueryHandler(_context, _currentUserServiceMock.Object);
        var query = new GetNotificationsQuery(Page: 1, PageSize: 20, UnreadOnly: true);

        var result = await handler.Handle(query, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data!.Items.Should().HaveCount(1);
        result.Data.Items.First().Id.Should().Be(1);
    }

    [Fact]
    public async Task GetNotifications_ThrowsForbidden_WhenAccessingUnauthorizedProject()
    {
        var handler = new GetNotificationsQueryHandler(_context, _currentUserServiceMock.Object);
        var query = new GetNotificationsQuery(ProjectId: _project2Id);

        var act = () => handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsAccurateCountForCurrentUser()
    {
        var handler = new GetUnreadCountQueryHandler(_context, _currentUserServiceMock.Object);
        var query = new GetUnreadCountQuery();

        var result = await handler.Handle(query, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data!.Count.Should().Be(1); // Notification 1 is unread, Notification 2 is read
    }

    [Fact]
    public async Task MarkNotificationRead_MarksReadSuccessfully()
    {
        var handler = new MarkNotificationReadCommandHandler(_context, _currentUserServiceMock.Object);
        var command = new MarkNotificationReadCommand(1);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeTrue();
        var notification = await _context.Notifications.FindAsync(1L);
        notification!.IsRead.Should().BeTrue();
        notification.ReadAt.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkNotificationRead_ThrowsForbidden_OnIDORAttempt()
    {
        var handler = new MarkNotificationReadCommandHandler(_context, _currentUserServiceMock.Object);
        // User 1 attempts to mark User 2's notification (ID 3) as read
        var command = new MarkNotificationReadCommand(3);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task MarkAllNotificationsRead_MarksOnlyCurrentUsersNotifications()
    {
        var handler = new MarkAllNotificationsReadCommandHandler(_context, _currentUserServiceMock.Object);
        var command = new MarkAllNotificationsReadCommand();

        var result = await handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().Be(1); // Only 1 unread for User 1

        // User 2's notification must remain unread
        var user2Notif = await _context.Notifications.FindAsync(3L);
        user2Notif!.IsRead.Should().BeFalse();
    }
}
