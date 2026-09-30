using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Dashboard.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Dashboard;

public class DashboardEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DashboardEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProjectDashboard_AsSuperAdmin_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDashboardDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ProjectId.Should().Be(projectId);
    }

    [Fact]
    public async Task GetProjectDashboard_AsSEOExecutive_AssignedProject_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId; // Assigned to Executive

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDashboardDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetProjectDashboard_AsSEOExecutive_UnassignedProject_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectBId; // Unassigned to Executive

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetProjectDashboard_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetGlobalDashboard_AsSuperAdmin_ReturnsOkWithAllProjects()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await client.GetAsync("/api/v1/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalProjects.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetGlobalDashboard_AsSEOExecutive_ReturnsOkWithOnlyAssignedProjects()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var response = await client.GetAsync("/api/v1/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Projects.Should().OnlyContain(p => p.ProjectId == CustomWebApplicationFactory.ProjectAId);
    }

    [Fact]
    public async Task GetProjectDashboard_AsViewer_AssignedProject_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDashboardDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ProjectId.Should().Be(projectId);
    }

    [Fact]
    public async Task GetProjectDashboard_AsViewer_UnassignedProject_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectBId;

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetProjectDashboard_AuditHealthScore_Matches_AuditOverviewEndpoint()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var dashResponse = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");
        dashResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var dashResult = await dashResponse.Content.ReadFromJsonAsync<ApiResponse<ProjectDashboardDto>>();

        var auditResponse = await client.GetAsync($"/api/v1/projects/{projectId}/audit/overview");
        auditResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var auditResult = await auditResponse.Content.ReadFromJsonAsync<ApiResponse<InternalSEO.Application.Features.Audit.DTOs.AuditOverviewDto>>();

        dashResult!.Data!.Health.HealthScore.Should().Be(auditResult!.Data!.HealthScore);
        dashResult.Data.Health.TotalUrlsCrawled.Should().Be(auditResult.Data.UrlsCrawled);
        dashResult.Data.Health.ErrorsCount.Should().Be(auditResult.Data.ErrorsCount);
        dashResult.Data.Health.WarningsCount.Should().Be(auditResult.Data.WarningsCount);
        dashResult.Data.Health.NoticesCount.Should().Be(auditResult.Data.NoticesCount);
    }

    [Fact]
    public async Task GetProjectDashboard_RankingsSearchVisibility_Matches_RankingsOverviewEndpoint()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var dashResponse = await client.GetAsync($"/api/v1/projects/{projectId}/dashboard");
        dashResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var dashResult = await dashResponse.Content.ReadFromJsonAsync<ApiResponse<ProjectDashboardDto>>();

        var rankingsResponse = await client.GetAsync($"/api/v1/projects/{projectId}/rankings/overview?timeRange=month");
        rankingsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var rankingsResult = await rankingsResponse.Content.ReadFromJsonAsync<ApiResponse<InternalSEO.Application.Features.Rankings.DTOs.RankingsOverviewDto>>();

        dashResult!.Data!.Rankings.SearchVisibility.Should().Be(rankingsResult!.Data!.SearchVisibility);
        dashResult.Data.Rankings.TotalKeywords.Should().Be(rankingsResult.Data.TotalTrackedKeywords);
        dashResult.Data.Rankings.AveragePosition.Should().Be(rankingsResult.Data.AveragePosition);
    }

    [Fact]
    public async Task GetGlobalDashboard_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private (HttpClient client, Guid userId) CreateUserWithRole(string roleName, bool assignToProjectA)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InternalSEO.Infrastructure.Persistence.ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

        var userId = Guid.NewGuid();
        var email = $"{roleName.ToLowerInvariant().Replace(" ", "")}_{userId:N}@test.internal";

        var user = new User
        {
            Id = userId,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            FirstName = "Test",
            LastName = roleName,
            IsActive = true
        };
        user.PasswordHash = passwordHasher.HashPassword(user, "TestPassword123!");
        db.Users.Add(user);

        var role = db.Roles.FirstOrDefault(r => r.Name == roleName);
        if (role == null)
        {
            role = new Role { Id = Guid.NewGuid(), Name = roleName, NormalizedName = roleName.ToUpperInvariant() };
            db.Roles.Add(role);
        }
        db.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });

        if (assignToProjectA)
        {
            db.ProjectMembers.Add(new ProjectMember
            {
                Id = Guid.NewGuid(),
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                UserId = userId,
                AccessLevel = ProjectAccessLevel.Member
            });
        }

        db.SaveChanges();

        var client = _factory.CreateAuthenticatedClient(roleName, userId, email);
        return (client, userId);
    }

    [Fact]
    public async Task Rbac_Admin_RestrictedToAssignedProjects_WhenNotSuperAdmin()
    {
        var (client, _) = CreateUserWithRole("Admin", assignToProjectA: true);

        // Authorized on Project A
        var projAResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/dashboard");
        projAResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Forbidden on unassigned Project B
        var projBResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/dashboard");
        projBResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Global Dashboard only contains Project A
        var globalResponse = await client.GetAsync("/api/v1/dashboard");
        globalResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var globalResult = await globalResponse.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        globalResult!.Data!.Projects.Should().OnlyContain(p => p.ProjectId == CustomWebApplicationFactory.ProjectAId);
    }

    [Fact]
    public async Task Rbac_SeoManager_RestrictedToAssignedProjects()
    {
        var (client, _) = CreateUserWithRole("SEO Manager", assignToProjectA: true);

        // Authorized on Project A
        var projAResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/dashboard");
        projAResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Forbidden on unassigned Project B
        var projBResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/dashboard");
        projBResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Global Dashboard only contains Project A
        var globalResponse = await client.GetAsync("/api/v1/dashboard");
        globalResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var globalResult = await globalResponse.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        globalResult!.Data!.Projects.Should().OnlyContain(p => p.ProjectId == CustomWebApplicationFactory.ProjectAId);
    }

    [Fact]
    public async Task Rbac_ContentWriter_RestrictedToAssignedProjects()
    {
        var (client, _) = CreateUserWithRole("Content Writer", assignToProjectA: true);

        // Authorized on Project A
        var projAResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/dashboard");
        projAResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Forbidden on unassigned Project B
        var projBResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/dashboard");
        projBResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Global Dashboard only contains Project A
        var globalResponse = await client.GetAsync("/api/v1/dashboard");
        globalResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var globalResult = await globalResponse.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        globalResult!.Data!.Projects.Should().OnlyContain(p => p.ProjectId == CustomWebApplicationFactory.ProjectAId);
    }

    [Fact]
    public async Task Rbac_NonMember_ForbiddenFromAllProjects()
    {
        var (client, _) = CreateUserWithRole(SystemRoles.Viewer, assignToProjectA: false);

        // Forbidden on Project A
        var projAResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/dashboard");
        projAResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Forbidden on Project B
        var projBResponse = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/dashboard");
        projBResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Global Dashboard returns 200 with 0 projects
        var globalResponse = await client.GetAsync("/api/v1/dashboard");
        globalResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var globalResult = await globalResponse.Content.ReadFromJsonAsync<ApiResponse<GlobalDashboardDto>>();
        globalResult!.Data!.TotalProjects.Should().Be(0);
        globalResult.Data.Projects.Should().BeEmpty();
    }
}



