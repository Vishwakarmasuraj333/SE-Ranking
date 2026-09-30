using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.ActivityLogs.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Admin;

public class ActivityLogsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ActivityLogsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetActivityLogs_AsSuperAdmin_Returns200OkWithLogs()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.ActivityLogs.Add(new ActivityLog
            {
                ActionType = "Project.Created",
                EntityType = "Project",
                EntityId = Guid.NewGuid().ToString(),
                ActorEmail = "admin@company.internal",
                ActorRole = SystemRoles.SuperAdmin,
                PayloadJson = "{\"test\":true}",
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await client.GetAsync("/api/v1/admin/activity-logs");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<ActivityLogDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Items.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("SEO Manager")]
    [InlineData("Content Writer")]
    [InlineData("SEO Executive")]
    [InlineData("Viewer")]
    public async Task GetActivityLogs_AsNonSuperAdmin_Returns403Forbidden(string role)
    {
        var client = _factory.CreateAuthenticatedClient(
            role, Guid.NewGuid(), $"{role.Replace(" ", "").ToLower()}@company.internal");

        var response = await client.GetAsync("/api/v1/admin/activity-logs");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("SEO Manager")]
    [InlineData("Content Writer")]
    [InlineData("SEO Executive")]
    [InlineData("Viewer")]
    public async Task GetActivityLogs_AsNonSuperAdminWithProjectId_CannotBypassAuthorization(string role)
    {
        var client = _factory.CreateAuthenticatedClient(
            role, Guid.NewGuid(), $"{role.Replace(" ", "").ToLower()}@company.internal");

        var response = await client.GetAsync($"/api/v1/admin/activity-logs?projectId={Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetActivityLogs_GlobalLogs_ReturnsNullProjectIdAndNullProjectName()
    {
        var globalLogAction = "Global.Action." + Guid.NewGuid().ToString("N");
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.ActivityLogs.Add(new ActivityLog
            {
                ActionType = globalLogAction,
                EntityType = "System",
                EntityId = "system-1",
                ProjectId = null,
                ActorEmail = "admin@company.internal",
                ActorRole = SystemRoles.SuperAdmin,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await client.GetAsync($"/api/v1/admin/activity-logs?actionType={globalLogAction}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<ActivityLogDto>>>();
        content.Should().NotBeNull();
        content!.Data!.Items.Should().HaveCount(1);
        var item = content.Data.Items.First();
        item.ProjectId.Should().BeNull();
        item.ProjectName.Should().BeNull();
    }

    [Fact]
    public async Task GetActivityLogs_Anonymous_Returns401Unauthorized()
    {
        var anonClient = _factory.CreateClient();

        var response = await anonClient.GetAsync("/api/v1/admin/activity-logs");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetActivityLogs_FilterByProject_ReturnsMatchingProjectLogs()
    {
        var targetProjId = Guid.NewGuid();
        var otherProjId = Guid.NewGuid();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var p1 = new Project { Id = targetProjId, Name = "Target Project", PrimaryDomain = "target.com" };
            var p2 = new Project { Id = otherProjId, Name = "Other Project", PrimaryDomain = "other.com" };
            db.Projects.AddRange(p1, p2);

            db.ActivityLogs.Add(new ActivityLog
            {
                ActionType = "Project.Updated",
                EntityType = "Project",
                EntityId = targetProjId.ToString(),
                ProjectId = targetProjId,
                ActorEmail = "admin@company.internal",
                ActorRole = SystemRoles.SuperAdmin,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await client.GetAsync($"/api/v1/admin/activity-logs?projectId={targetProjId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<ActivityLogDto>>>();
        content.Should().NotBeNull();
        content!.Data!.Items.Should().Contain(x => x.ProjectId == targetProjId);
        content.Data.Items.Should().OnlyContain(x => x.ProjectId == targetProjId);
    }

    [Fact]
    public async Task GetActivityLogs_MutationRoutes_DoNotExist()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var postRes = await client.PostAsJsonAsync("/api/v1/admin/activity-logs", new { test = true });
        postRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.MethodNotAllowed);

        var putRes = await client.PutAsJsonAsync("/api/v1/admin/activity-logs/1", new { test = true });
        putRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.MethodNotAllowed);

        var patchRes = await client.PatchAsJsonAsync("/api/v1/admin/activity-logs/1", new { test = true });
        patchRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.MethodNotAllowed);

        var delRes = await client.DeleteAsync("/api/v1/admin/activity-logs/1");
        delRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.MethodNotAllowed);
    }

    [Fact]
    public async Task ExistingActivityLogger_StillLogsMutationsCorrectly()
    {
        using var scope = _factory.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<IActivityLogger>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var testAction = "Test.Mutation." + Guid.NewGuid().ToString("N");
        await logger.LogAsync(
            actionType: testAction,
            entityType: "TestEntity",
            entityId: "test-123",
            projectId: null,
            payload: new { message = "hello" },
            cancellationToken: CancellationToken.None);

        var logged = await db.ActivityLogs.AnyAsync(x => x.ActionType == testAction);
        logged.Should().BeTrue();
    }
}
