using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Keywords;

public class KeywordsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public KeywordsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateKeyword_AsSuperAdmin_Returns201CreatedAndEmitsActivityLog()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var request = new CreateKeywordRequest
        {
            KeywordText = "enterprise cloud seo",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop",
            TargetUrl = "https://alpha.company.com/cloud",
            SearchIntent = "Commercial",
            Tags = new List<string> { "cloud", "q3-focus" }
        };

        // Act
        var response = await adminClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<KeywordDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.KeywordText.Should().Be("enterprise cloud seo");
        content.Data.Tags.Should().Contain(new[] { "cloud", "q3-focus" });

        // Verify in Database & Activity Log
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var kw = await db.Keywords.FirstOrDefaultAsync(k => k.Id == content.Data.Id);
        kw.Should().NotBeNull();
        kw!.KeywordText.Should().Be("enterprise cloud seo");

        var log = await db.ActivityLogs.FirstOrDefaultAsync(l => l.ActionType == "Keyword.Created" && l.EntityId == kw.Id.ToString());
        log.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateKeyword_AsSEOExecutive_OnAssignedProject_Returns201Created()
    {
        // Arrange
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var request = new CreateKeywordRequest
        {
            KeywordText = "executive organic visibility",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop"
        };

        // Act
        var response = await seoClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreateKeyword_AsViewer_Returns403Forbidden()
    {
        // Arrange
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var request = new CreateKeywordRequest
        {
            KeywordText = "viewer attempt keyword"
        };

        // Act
        var response = await viewerClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateKeyword_AsSEOExecutive_OnUnassignedProject_Returns403Forbidden()
    {
        // Arrange
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var request = new CreateKeywordRequest
        {
            KeywordText = "unauthorized project keyword"
        };

        // Act (Project B is secret, not assigned to SEO Exec)
        var response = await seoClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/keywords", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetKeywords_AsViewer_Returns200OKWithPagedList()
    {
        // Arrange
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        // Act
        var response = await viewerClient.GetAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<KeywordDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateKeyword_AsSEOExecutive_Returns200OK()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var createRes = await adminClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords",
            new CreateKeywordRequest { KeywordText = "keyword to update" });
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<KeywordDto>>();

        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var updateReq = new UpdateKeywordRequest
        {
            TargetUrl = "https://alpha.company.com/updated",
            SearchIntent = "Transactional",
            IsActive = false
        };

        // Act
        var response = await seoClient.PutAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords/{created!.Data!.Id}", updateReq);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<KeywordDto>>();
        content!.Data!.TargetUrl.Should().Be("https://alpha.company.com/updated");
        content.Data.SearchIntent.Should().Be("Transactional");
        content.Data.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateKeyword_AsViewer_Returns403Forbidden()
    {
        // Arrange
        var adminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var createRes = await adminClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords",
            new CreateKeywordRequest { KeywordText = "viewer update target" });
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<KeywordDto>>();

        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        // Act
        var response = await viewerClient.PutAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords/{created!.Data!.Id}",
            new UpdateKeywordRequest { IsActive = false });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeleteKeyword_AsViewer_Returns403Forbidden()
    {
        // Arrange
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        // Act
        var response = await viewerClient.DeleteAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ExportCsv_AsViewer_Returns200OKWithCsv()
    {
        // Arrange
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        // Act
        var response = await viewerClient.GetAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keywords/export-csv");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("text/csv");
        var csv = await response.Content.ReadAsStringAsync();
        csv.Should().Contain("Keyword,Search Engine,Country,Device");
    }

    [Fact]
    public async Task KeywordGroup_CreateAsSEOExecutive_Returns201Created()
    {
        // Arrange
        var seoClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var req = new CreateKeywordGroupRequest { Name = "Features", ColorHex = "#10B981" };

        // Act
        var response = await seoClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keyword-groups", req);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task KeywordGroup_CreateAsViewer_Returns403Forbidden()
    {
        // Arrange
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var req = new CreateKeywordGroupRequest { Name = "Viewer Group" };

        // Act
        var response = await viewerClient.PostAsJsonAsync(
            $"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/keyword-groups", req);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
