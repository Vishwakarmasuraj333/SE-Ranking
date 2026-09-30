using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Projects.Commands.CreateProject;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Projects;

public class ProjectsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ProjectsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateProject_AsSuperAdmin_Returns201CreatedAndLogsActivity()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var command = new CreateProjectCommand
        {
            Name = "New Production Site",
            PrimaryDomain = "https://newsite.company.com/",
            Protocol = "https://",
            Industry = "Technology",
            CountryCode = "US",
            LanguageCode = "en",
            Timezone = "America/New_York",
            DefaultDevice = "desktop",
            DefaultSearchEngine = "google"
        };

        // Act
        var response = await adminClient.PostAsJsonAsync("/api/v1/projects", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Name.Should().Be("New Production Site");
        content.Data.PrimaryDomain.Should().Be("newsite.company.com");

        // Verify in Database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var project = await db.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.Id == content.Data.Id);
        project.Should().NotBeNull();
        project!.Members.Should().ContainSingle(m => m.UserId == CustomWebApplicationFactory.AdminUserId && m.AccessLevel == ProjectAccessLevel.Owner);

        // Verify Activity Log was written
        var log = await db.ActivityLogs.FirstOrDefaultAsync(l => l.ActionType == "Project.Created" && l.ProjectId == project.Id);
        log.Should().NotBeNull();
        log!.ActorEmail.Should().Be("admin@company.internal");
    }

    [Fact]
    public async Task CreateProject_AsSEOExecutive_Returns403Forbidden()
    {
        // Arrange
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var command = new CreateProjectCommand
        {
            Name = "Unauthorized Site",
            PrimaryDomain = "unauthorized.com"
        };

        // Act
        var response = await seoClient.PostAsJsonAsync("/api/v1/projects", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetProjects_AsSuperAdmin_ReturnsAllProjects()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await adminClient.GetAsync("/api/v1/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<ProjectDto>>>();
        content.Should().NotBeNull();
        content!.Data!.Items.Should().Contain(p => p.Id == CustomWebApplicationFactory.ProjectAId);
        content.Data.Items.Should().Contain(p => p.Id == CustomWebApplicationFactory.ProjectBId);
    }

    [Fact]
    public async Task GetProjects_AsSEOExecutive_ReturnsOnlyAssignedProjects()
    {
        // Arrange
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Act
        var response = await seoClient.GetAsync("/api/v1/projects");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<ProjectDto>>>();
        content.Should().NotBeNull();

        // SEO Executive is member of Project A, but NOT Project B
        content!.Data!.Items.Should().Contain(p => p.Id == CustomWebApplicationFactory.ProjectAId);
        content.Data.Items.Should().NotContain(p => p.Id == CustomWebApplicationFactory.ProjectBId);
    }

    [Fact]
    public async Task GetProjectById_WhenNotAssignedToProject_Returns403Forbidden()
    {
        // Arrange
        // Project B is secret (not assigned to SEO Executive)
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Act
        var response = await seoClient.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task UpdateProject_AsViewer_Returns403Forbidden()
    {
        // Arrange
        // Viewer has ReadOnly access to Project A
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var request = new UpdateProjectRequest
        {
            Name = "Viewer Modified Name",
            Status = ProjectStatus.Active
        };

        // Act
        var response = await viewerClient.PutAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task UpdateProject_AsSuperAdmin_Returns200OK()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var request = new UpdateProjectRequest
        {
            Name = "Updated Alpha Name",
            Timezone = "UTC",
            Status = ProjectStatus.Active
        };

        // Act
        var response = await adminClient.PutAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectDto>>();
        content.Should().NotBeNull();
        content!.Data!.Name.Should().Be("Updated Alpha Name");
    }
}
