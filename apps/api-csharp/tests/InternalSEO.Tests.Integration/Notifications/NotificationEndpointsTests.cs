using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Notifications.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Notifications;

public class NotificationEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private static readonly Guid NonMemberUserId = Guid.Parse("99999999-9999-9999-9999-999999999999");

    public NotificationEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedTestNotifications();
    }

    private void SeedTestNotifications()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure non-member exists in database
        if (!db.Users.Any(u => u.Id == NonMemberUserId))
        {
            db.Users.Add(new User
            {
                Id = NonMemberUserId,
                Email = "nonmember@example.com",
                NormalizedEmail = "NONMEMBER@EXAMPLE.COM",
                FirstName = "Non",
                LastName = "Member",
                PasswordHash = "hashed"
            });
            db.SaveChanges();
        }

        if (!db.Notifications.Any(n => n.ProjectId == CustomWebApplicationFactory.ProjectAId))
        {
            var now = DateTimeOffset.UtcNow;
            db.Notifications.AddRange(
                new Notification
                {
                    Id = 101,
                    ProjectId = CustomWebApplicationFactory.ProjectAId,
                    UserId = CustomWebApplicationFactory.AdminUserId,
                    Title = "Admin Alert",
                    Message = "Admin specific notification",
                    Severity = "Info",
                    EventType = "TaskAssigned",
                    TargetUrl = $"/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/task-101",
                    IsRead = false,
                    CreatedAt = now.AddMinutes(-20)
                },
                new Notification
                {
                    Id = 102,
                    ProjectId = CustomWebApplicationFactory.ProjectAId,
                    UserId = CustomWebApplicationFactory.SeoUserId,
                    Title = "SEO Exec Alert",
                    Message = "SEO Exec specific notification",
                    Severity = "Warning",
                    EventType = "HealthScoreDrop",
                    TargetUrl = $"/projects/{CustomWebApplicationFactory.ProjectAId}/audit?runId=run-102",
                    IsRead = false,
                    CreatedAt = now.AddMinutes(-15)
                },
                new Notification
                {
                    Id = 103,
                    ProjectId = CustomWebApplicationFactory.ProjectAId,
                    UserId = CustomWebApplicationFactory.ViewerUserId,
                    Title = "Viewer Alert",
                    Message = "Viewer notification",
                    Severity = "Critical",
                    EventType = "KeywordDrop",
                    TargetUrl = $"/projects/{CustomWebApplicationFactory.ProjectAId}/rankings?keywordId=kw-103",
                    IsRead = false,
                    CreatedAt = now.AddMinutes(-10)
                },
                new Notification
                {
                    Id = 104,
                    ProjectId = CustomWebApplicationFactory.ProjectBId,
                    UserId = NonMemberUserId,
                    Title = "Project B Secret Alert",
                    Message = "Should not be visible to Project A users",
                    Severity = "Critical",
                    EventType = "SyncFailed",
                    TargetUrl = $"/projects/{CustomWebApplicationFactory.ProjectBId}/settings/integrations/gsc",
                    IsRead = false,
                    CreatedAt = now
                }
            );

            db.SaveChanges();
        }
    }

    [Fact]
    public async Task GetNotifications_Anonymous_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/notifications");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetNotifications_AsAdmin_ReturnsOnlyOwnNotifications()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var response = await client.GetAsync("/api/v1/notifications");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<NotificationDto>>>();
        body!.Success.Should().BeTrue();
        body.Data!.Items.Should().NotBeEmpty();
        body.Data.Items.All(n => n.UserId == CustomWebApplicationFactory.AdminUserId).Should().BeTrue();
    }

    [Fact]
    public async Task GetNotifications_AsSeoExecutive_ReturnsOnlyOwnNotifications()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");
        var response = await client.GetAsync("/api/v1/notifications");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<NotificationDto>>>();
        body!.Success.Should().BeTrue();
        body.Data!.Items.Should().Contain(n => n.Id == 102);
        body.Data.Items.Should().NotContain(n => n.Id == 101); // Admin's alert not visible
        body.Data.Items.Should().NotContain(n => n.Id == 104); // Project B's alert not visible
    }

    [Fact]
    public async Task GetNotifications_AsViewer_ReturnsOnlyOwnNotifications()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync("/api/v1/notifications");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<NotificationDto>>>();
        body!.Success.Should().BeTrue();
        body.Data!.Items.Should().Contain(n => n.Id == 103);
        body.Data.Items.Should().NotContain(n => n.Id == 101);
    }

    [Fact]
    public async Task GetNotifications_NonMemberAccessingProjectB_ReturnsForbidden()
    {
        // Viewer is not member of Project B
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync($"/api/v1/notifications?projectId={CustomWebApplicationFactory.ProjectBId}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsOnlyCurrentUsersUnreadCount()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");
        var response = await client.GetAsync("/api/v1/notifications/unread-count");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<UnreadCountDto>>();
        body!.Success.Should().BeTrue();
        body.Data!.Count.Should().BeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task MarkAsRead_AsOwner_Succeeds()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");
        var response = await client.PatchAsync("/api/v1/notifications/102/read", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify in database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var notif = await db.Notifications.FindAsync(102L);
        notif!.IsRead.Should().BeTrue();
        notif.ReadAt.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkAsRead_IDORAttempt_ReturnsForbidden()
    {
        // Viewer attempts to mark SEO Executive's notification (102) as read
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.PatchAsync("/api/v1/notifications/102/read", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task MarkAllAsRead_MarksOnlyCurrentUsersNotifications()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.PostAsync("/api/v1/notifications/read-all", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify viewer's notification is read
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var viewerNotif = await db.Notifications.FindAsync(103L);
        viewerNotif!.IsRead.Should().BeTrue();

        // Verify admin notification (101) was untouched
        var adminNotif = await db.Notifications.FindAsync(101L);
        adminNotif!.IsRead.Should().BeFalse();
    }
}
