using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Competitors;

public class CompetitorEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CompetitorEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedCompetitorTestData();
    }

    private void SeedCompetitorTestData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var projectAId = CustomWebApplicationFactory.ProjectAId;
        var projectBId = CustomWebApplicationFactory.ProjectBId;

        // Ensure Project A has at least one competitor
        if (!db.Competitors.Any(c => c.ProjectId == projectAId))
        {
            var comp = new Competitor
            {
                Id = Guid.NewGuid(),
                ProjectId = projectAId,
                Name = "Alpha Rival",
                Domain = "alpharival.com",
                Notes = "Primary rival for alpha company"
            };
            db.Competitors.Add(comp);

            // Ensure a keyword exists
            var kw = db.Keywords.FirstOrDefault(k => k.ProjectId == projectAId);
            if (kw == null)
            {
                kw = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectAId,
                    KeywordText = "competitor test kw",
                    SearchEngine = "google",
                    CountryCode = "US",
                    Device = "desktop",
                    CreatedBy = CustomWebApplicationFactory.AdminUserId
                };
                db.Keywords.Add(kw);
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.CompetitorRankResults.Add(new CompetitorRankResult
            {
                CompetitorId = comp.Id,
                KeywordId = kw.Id,
                ProjectId = projectAId,
                CheckDate = today,
                Position = 4,
                PreviousPosition = 6,
                PositionChange = 2,
                RankedUrl = "https://alpharival.com/blog/test",
                ProviderName = "development",
                RecordedAt = DateTimeOffset.UtcNow
            });

            db.SaveChanges();
        }

        // Ensure Project B has a competitor for cross-project isolation tests
        if (!db.Competitors.Any(c => c.ProjectId == projectBId))
        {
            db.Competitors.Add(new Competitor
            {
                Id = Guid.NewGuid(),
                ProjectId = projectBId,
                Name = "Beta Rival",
                Domain = "betarival.com",
                Notes = "Rival for beta"
            });
            db.SaveChanges();
        }
    }

    [Fact]
    public async Task GetCompetitors_AsSuperAdmin_Returns200WithCompetitors()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<List<CompetitorDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetCompetitors_AsSEOExecutive_AssignedProject_Returns200()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<List<CompetitorDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task GetCompetitors_AsSEOExecutive_UnassignedProject_Returns403Forbidden()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/competitors");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetCompetitors_AsViewer_AssignedProject_Returns200()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCompetitors_AsViewer_UnassignedProject_Returns403Forbidden()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/competitors");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AddCompetitor_AsViewer_Returns403Forbidden()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var req = new AddCompetitorRequest("Forbidden Comp", "forbidden.com", null);
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors", req);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AddCompetitor_AsSEOExecutive_AssignedProject_SucceedsWith201()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var domain = $"test-add-{Guid.NewGuid():N}.com";
        var req = new AddCompetitorRequest("Dynamic Comp", $"https://www.{domain}/", "Added in test");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors", req);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Domain.Should().Be(domain);
    }

    [Fact]
    public async Task AddCompetitor_TargetDomainCollision_Returns400BadRequest()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        // PrimaryDomain for Project A is alpha.company.com
        var req = new AddCompetitorRequest("Target Duplicate", "https://www.alpha.company.com", null);
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors", req);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateCompetitor_AsSEOExecutive_Succeeds()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var comp = db.Competitors.First(c => c.ProjectId == CustomWebApplicationFactory.ProjectAId);

        var req = new UpdateCompetitorRequest("Updated Name", comp.Domain, "Updated notes");
        var response = await client.PutAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/{comp.Id}", req);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorDto>>();
        content!.Data!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task DeleteCompetitor_AsSEOExecutive_Succeeds()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        // First add one to delete
        var domain = $"delete-{Guid.NewGuid():N}.com";
        var addReq = new AddCompetitorRequest("To Be Deleted", domain, null);
        var addRes = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors", addReq);
        var added = await addRes.Content.ReadFromJsonAsync<ApiResponse<CompetitorDto>>();
        var compId = added!.Data!.Id;

        // Delete
        var delRes = await client.DeleteAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/{compId}");
        delRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify gone
        var getRes = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors");
        var list = await getRes.Content.ReadFromJsonAsync<ApiResponse<List<CompetitorDto>>>();
        list!.Data.Should().NotContain(c => c.Id == compId);
    }

    [Fact]
    public async Task CrossProjectIsolation_CannotDeleteCompetitorFromAnotherProject()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var compB = db.Competitors.First(c => c.ProjectId == CustomWebApplicationFactory.ProjectBId);

        // Try to delete Project B competitor via Project A path (IDOR check)
        var response = await client.DeleteAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/{compB.Id}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCompetitorOverview_ReturnsSideBySideMetrics()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/overview?days=30");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorOverviewDto>>();
        content.Should().NotBeNull();
        content!.Data!.Summaries.Should().NotBeEmpty();
        content.Data.Summaries.Should().Contain(s => s.IsTargetDomain);
    }

    [Fact]
    public async Task GetCompetitorKeywords_ReturnsMatrixResponse()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/keywords?page=1&pageSize=25");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorKeywordsResponseDto>>();
        content.Should().NotBeNull();
        content!.Data!.Items.Should().NotBeNull();
        content.Data.Competitors.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCompetitorVisibility_ReturnsMetricsAndOverlap()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/visibility?days=30");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorVisibilityResponseDto>>();
        content.Should().NotBeNull();
        content!.Data.Should().NotBeNull();
        content.Data!.Summaries.Should().NotBeEmpty();
        content.Data.Summaries.Should().Contain(s => s.IsTargetDomain);
        
        var targetSummary = content.Data.Summaries.First(s => s.IsTargetDomain);
        targetSummary.Top20Count.Should().BeGreaterThanOrEqualTo(0);
        targetSummary.UnrankedCount.Should().BeGreaterThanOrEqualTo(0);
        targetSummary.Top20OverlapCount.Should().BeGreaterThanOrEqualTo(0);
    }
}

