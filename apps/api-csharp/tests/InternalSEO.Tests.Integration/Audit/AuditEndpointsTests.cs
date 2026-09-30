using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Audit;

public class AuditEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuditEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedAuditData();
    }

    private void SeedAuditData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!db.CrawlRuns.Any(r => r.ProjectId == CustomWebApplicationFactory.ProjectAId))
        {
            var run = new CrawlRun
            {
                Id = Guid.NewGuid(),
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                Status = "Completed",
                TriggerSource = "Manual",
                UrlsCrawled = 25,
                UrlsDiscovered = 30,
                ErrorsCount = 2,
                WarningsCount = 3,
                NoticesCount = 1,
                HealthScore = 92.0m,
                CreatedAt = DateTimeOffset.UtcNow.AddHours(-1)
            };
            db.CrawlRuns.Add(run);

            var rule404 = db.AuditRules.Find("RULE-HTTP-404");
            if (rule404 == null)
            {
                rule404 = new AuditRule { Id = "RULE-HTTP-404", Title = "404 Not Found", Category = "Indexability" };
                db.AuditRules.Add(rule404);
            }

            db.AuditIssues.Add(new AuditIssue
            {
                Id = Guid.NewGuid(),
                CrawlRunId = run.Id,
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                RuleCode = "RULE-HTTP-404",
                Severity = "Error",
                AffectedUrl = "https://alpha.company.com/not-found",
                AffectedUrlHash = "hash404",
                Status = "Open",
                FirstSeenAt = DateTimeOffset.UtcNow,
                LastSeenAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow
            });

            db.CrawlPages.Add(new CrawlPage
            {
                CrawlRunId = run.Id,
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                Url = "https://alpha.company.com/",
                UrlHash = "hashhome",
                HttpStatusCode = 200,
                Title = "Home",
                IsIndexable = true,
                CrawledAt = DateTimeOffset.UtcNow
            });

            db.SaveChanges();
        }
    }

    [Fact]
    public async Task GetAuditOverview_ReturnsSuccess_ForProjectMember()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@internal-seo.local");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/overview");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<AuditOverviewDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().NotBeNull();
        body.Data!.UrlsCrawled.Should().Be(25);
        body.Data.HealthScore.Should().Be(92.0m);
    }

    [Fact]
    public async Task GetAuditOverview_ReturnsForbidden_ForUnassignedProject()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@internal-seo.local");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/audit/overview");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAuditOverview_ReturnsUnauthorized_WhenNoTokenProvided()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/overview");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task StartCrawl_ReturnsForbidden_ForReadOnlyViewer()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@internal-seo.local");

        var response = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/crawl", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task StartCrawl_EnqueuesCrawl_ForProjectWriter()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@internal-seo.local");

        var response = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/crawl", null);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task UpdateSettings_ReturnsBadRequest_OnInvalidValues()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@internal-seo.local");

        var invalidRequest = new UpdateCrawlSettingsRequest(
            CrawlMaxPages: 0, // Invalid: must be >= 1
            CrawlMaxDepth: 5,
            CrawlConcurrency: 2,
            CrawlRateLimitMs: 100,
            CrawlRespectRobotsTxt: true,
            CrawlUserAgent: "Bot"
        );

        var response = await client.PutAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/settings", invalidRequest);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateSettings_UpdatesSuccessfully_ForProjectWriter()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@internal-seo.local");

        var validRequest = new UpdateCrawlSettingsRequest(
            CrawlMaxPages: 250,
            CrawlMaxDepth: 6,
            CrawlConcurrency: 3,
            CrawlRateLimitMs: 150,
            CrawlRespectRobotsTxt: true,
            CrawlUserAgent: "ValidBot/1.0"
        );

        var response = await client.PutAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/audit/settings", validRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<ProjectSettingsDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data!.CrawlMaxPages.Should().Be(250);
        body.Data.CrawlMaxDepth.Should().Be(6);
    }
}
