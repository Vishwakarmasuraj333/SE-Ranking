using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.GoogleIntegrations;

public class GscEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GscEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedGscTestData();
    }

    private void SeedGscTestData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var projectAId = CustomWebApplicationFactory.ProjectAId;

        if (!db.GoogleConnections.Any(c => c.ProjectId == projectAId))
        {
            var conn = new GoogleConnection
            {
                Id = Guid.NewGuid(),
                ProjectId = projectAId,
                ServiceType = GoogleConstants.ServiceTypes.Gsc,
                PropertyIdentifier = "sc-domain:example.com",
                AccountEmail = "admin@example.com",
                EncryptedRefreshToken = "mock_encrypted_token_123",
                SyncStatus = GoogleConstants.SyncStatuses.Active,
                LastSyncedAt = DateTimeOffset.UtcNow.AddHours(-2)
            };
            db.GoogleConnections.Add(conn);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var metricDate = today.AddDays(-2);

            db.GscDailyMetrics.Add(new GscDailyMetric
            {
                ProjectId = projectAId,
                MetricDate = metricDate,
                Device = "ALL",
                Clicks = 1500,
                Impressions = 25000,
                Ctr = 0.0600m,
                AveragePosition = 4.2m
            });

            db.GscDailyMetrics.Add(new GscDailyMetric
            {
                ProjectId = projectAId,
                MetricDate = metricDate,
                Device = "DESKTOP",
                Clicks = 900,
                Impressions = 15000,
                Ctr = 0.0600m,
                AveragePosition = 3.9m
            });

            db.GscQueryMetrics.Add(new GscQueryMetric
            {
                ProjectId = projectAId,
                MetricDate = metricDate,
                QueryText = "enterprise rank tracker",
                PageUrl = "/products/rank-tracker",
                CountryCode = "USA",
                Device = "DESKTOP",
                Clicks = 320,
                Impressions = 4500,
                Ctr = 0.0711m,
                Position = 2.4m
            });

            db.SaveChanges();
        }
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAuthUrl_AsProjectWriter_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/gsc/auth-url");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GscAuthUrlDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.AuthUrl.Should().Contain("accounts.google.com");
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAuthUrl_AsViewer_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/gsc/auth-url");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetProperties_AsProjectWriter_ReturnsPropertiesList()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/gsc/properties");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<IReadOnlyList<GscPropertyDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task BindProperty_AsProjectWriter_BindsAndReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var body = new BindGscPropertyRequest("sc-domain:example.com");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/gsc/bind", body);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GscConnectionDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.PropertyIdentifier.Should().Be("sc-domain:example.com");
        result.Data.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Active);
    }

    [Fact]
    public async System.Threading.Tasks.Task CompleteOAuthCallback_DoesNotExposeSecretsInResponseDto()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var body = new CompleteGscOAuthCallbackRequest("valid_auth_code_123", "http://localhost:3000/callback", "state123");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/gsc/callback", body);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var rawJson = await response.Content.ReadAsStringAsync();

        rawJson.Should().NotContain("mock_refresh_token");
        rawJson.Should().NotContain("encryptedRefreshToken");
    }

    [Fact]
    public async System.Threading.Tasks.Task TriggerSync_AsProjectWriter_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/gsc/sync", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<string>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
    }

    [Fact]
    public async System.Threading.Tasks.Task GetOverview_AsViewer_ReturnsMetrics()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/gsc/overview");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GscPerformanceOverviewDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.TotalClicks.Should().BeGreaterThan(0);
        result.Data.TotalImpressions.Should().BeGreaterThan(0);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetQueries_AsMember_ReturnsPaginatedQueries()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/gsc/queries?page=1&pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<GscQueryRowDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task GetQueryHistory_AsMember_ReturnsQueryDetails()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/gsc/queries/enterprise rank tracker/history");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<GscQueryDetailDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.QueryText.Should().Be("enterprise rank tracker");
    }

    [Fact]
    public async System.Threading.Tasks.Task CrossProjectAccess_DeniedWithForbidden()
    {
        // SeoUserId is only assigned to ProjectA, not ProjectB
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/integrations/gsc/overview");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task Unauthenticated_DeniedWithUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/gsc/overview");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
