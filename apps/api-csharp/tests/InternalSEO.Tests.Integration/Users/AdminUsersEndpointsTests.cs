using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Users;

public class AdminUsersEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AdminUsersEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetUsers_AsSuperAdmin_Returns200OkWithUsersList()
    {
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await adminClient.GetAsync("/api/v1/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<AdminUserDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetUsers_AsSEOExecutive_Returns403Forbidden()
    {
        var execClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await execClient.GetAsync("/api/v1/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetUsers_Anonymous_Returns401Unauthorized()
    {
        var anonClient = _factory.CreateClient();

        var response = await anonClient.GetAsync("/api/v1/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateUser_AsSuperAdmin_Returns201CreatedAndPersistsUser()
    {
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var request = new CreateUserRequest
        {
            Email = $"integration-{Guid.NewGuid():N}@test.local",
            Password = "IntegrationPassword123!",
            FirstName = "Integration",
            LastName = "User",
            Role = SystemRoles.Viewer
        };

        var response = await adminClient.PostAsJsonAsync("/api/v1/admin/users", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<AdminUserDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Email.Should().Be(request.Email.ToLowerInvariant());
        content.Data.Role.Should().Be(SystemRoles.Viewer);

        // Verify in DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userInDb = await db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == content.Data.Id);
        userInDb.Should().NotBeNull();
        userInDb!.UserRoles.Should().ContainSingle(ur => ur.Role.Name == SystemRoles.Viewer);
    }

    [Fact]
    public async Task CreateUser_InvalidPassword_Returns400BadRequest()
    {
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var request = new CreateUserRequest
        {
            Email = $"short-pwd-{Guid.NewGuid():N}@test.local",
            Password = "123", // too short
            FirstName = "Short",
            LastName = "Password",
            Role = SystemRoles.Viewer
        };

        var response = await adminClient.PostAsJsonAsync("/api/v1/admin/users", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateUserRole_AsSuperAdmin_UpdatesRoleSuccessfully()
    {
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // First create user
        var userEmail = $"rolechange-{Guid.NewGuid():N}@test.local";
        var createRes = await adminClient.PostAsJsonAsync("/api/v1/admin/users", new CreateUserRequest
        {
            Email = userEmail,
            Password = "InitialPassword123!",
            FirstName = "Role",
            LastName = "Test",
            Role = SystemRoles.Viewer
        });
        createRes.EnsureSuccessStatusCode();
        var createdUser = (await createRes.Content.ReadFromJsonAsync<ApiResponse<AdminUserDto>>())!.Data!;

        // Update role to SEOExecutive
        var updateRes = await adminClient.PutAsJsonAsync($"/api/v1/admin/users/{createdUser.Id}/role", new UpdateUserRoleRequest
        {
            Role = SystemRoles.SEOExecutive
        });

        updateRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var updateContent = await updateRes.Content.ReadFromJsonAsync<ApiResponse<AdminUserDto>>();
        updateContent!.Data!.Role.Should().Be(SystemRoles.SEOExecutive);
    }

    [Fact]
    public async Task UpdateUserStatus_AsSuperAdmin_TogglesStatus()
    {
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // First create user
        var userEmail = $"statuschange-{Guid.NewGuid():N}@test.local";
        var createRes = await adminClient.PostAsJsonAsync("/api/v1/admin/users", new CreateUserRequest
        {
            Email = userEmail,
            Password = "InitialPassword123!",
            FirstName = "Status",
            LastName = "Test",
            Role = SystemRoles.Viewer
        });
        createRes.EnsureSuccessStatusCode();
        var createdUser = (await createRes.Content.ReadFromJsonAsync<ApiResponse<AdminUserDto>>())!.Data!;

        // Deactivate user
        var statusRes = await adminClient.PutAsJsonAsync($"/api/v1/admin/users/{createdUser.Id}/status", new UpdateUserStatusRequest
        {
            IsActive = false
        });

        statusRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var statusContent = await statusRes.Content.ReadFromJsonAsync<ApiResponse<AdminUserDto>>();
        statusContent!.Data!.IsActive.Should().BeFalse();
    }
}
