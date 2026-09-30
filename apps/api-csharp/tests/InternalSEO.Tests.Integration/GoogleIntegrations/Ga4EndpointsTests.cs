using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.GoogleIntegrations;

public class Ga4EndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public Ga4EndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedGa4TestData();
    }

    private void SeedGa4TestData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var projectAId = CustomWebApplicationFactory.ProjectAId;

        if (!db.GoogleConnections.Any(c => c.ProjectId == projectAId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4))
        {
            var conn = new GoogleConnection
            {
                Id = Guid.NewGuid(),
                ProjectId = projectAId,
                ServiceType = GoogleConstants.ServiceTypes.Ga4,
                PropertyIdentifier = "properties/123456789",
                AccountEmail = "admin@example.com",
                EncryptedRefreshToken = "mock_encrypted_ga4_token",
                SyncStatus = GoogleConstants.SyncStatuses.Active,
                LastSyncedAt = DateTimeOffset.UtcNow.AddHours(-2)
            };
            db.GoogleConnections.Add(conn);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var metricDate = today.AddDays(-2);

            db.Ga4DailyMetrics.Add(new Ga4DailyMetric
            {
                ProjectId = projectAId,
                PropertyIdentifier = "properties/123456789",
                MetricDate = metricDate,
                Sessions = 2500,
                ActiveUsers = 2100,
                EngagementRate = 0.6500m,
                Conversions = 120,
                Revenue = 4500.00m,
                SyncedAt = DateTimeOffset.UtcNow
            });

            db.Ga4LandingPageMetrics.Add(new Ga4LandingPageMetric
            {
                ProjectId = projectAId,
                PropertyIdentifier = "properties/123456789",
                MetricDate = metricDate,
                LandingPage = "/blog/enterprise-seo-strategy",
                Sessions = 1200,
                ActiveUsers = 1050,
                EngagementRate = 0.7000m,
                Conversions = 80,
                Revenue = 3000.00m,
                SyncedAt = DateTimeOffset.UtcNow
            });

            // Also seed for properties/987654321 so if BindProperty test runs first, Overview/Pages queries still find metrics
            db.Ga4DailyMetrics.Add(new Ga4DailyMetric
            {
                ProjectId = projectAId,
                PropertyIdentifier = "properties/987654321",
                MetricDate = metricDate,
                Sessions = 2500,
                ActiveUsers = 2100,
                EngagementRate = 0.6500m,
                Conversions = 120,
                Revenue = 4500.00m,
                SyncedAt = DateTimeOffset.UtcNow
            });

            db.Ga4LandingPageMetrics.Add(new Ga4LandingPageMetric
            {
                ProjectId = projectAId,
                PropertyIdentifier = "properties/987654321",
                MetricDate = metricDate,
                LandingPage = "/blog/enterprise-seo-strategy",
                Sessions = 1200,
                ActiveUsers = 1050,
                EngagementRate = 0.7000m,
                Conversions = 80,
                Revenue = 3000.00m,
                SyncedAt = DateTimeOffset.UtcNow
            });

            var projectBId = CustomWebApplicationFactory.ProjectBId;
            db.GoogleConnections.Add(new GoogleConnection
            {
                Id = Guid.NewGuid(),
                ProjectId = projectBId,
                ServiceType = GoogleConstants.ServiceTypes.Ga4,
                PropertyIdentifier = "properties/999999999",
                AccountEmail = "projectb@example.com",
                EncryptedRefreshToken = "mock_encrypted_ga4_token_b",
                SyncStatus = GoogleConstants.SyncStatuses.Active,
                LastSyncedAt = DateTimeOffset.UtcNow.AddHours(-1)
            });

            db.SaveChanges();
        }
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAuthUrl_AsProjectWriter_ReturnsOkWithNonceState()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/auth-url");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<Ga4AuthUrlDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.AuthUrl.Should().Contain("accounts.google.com");
        result.Data.State.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAuthUrl_AsViewer_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/auth-url");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetProperties_AsProjectWriter_ReturnsPropertiesList()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/properties");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<IReadOnlyList<Ga4PropertyDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task BindProperty_AsProjectWriter_BindsAndReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var body = new BindGa4PropertyRequest("properties/987654321");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/bind", body);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<Ga4ConnectionDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.PropertyIdentifier.Should().Be("properties/987654321");
        result.Data.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Active);
    }

    [Fact]
    public async System.Threading.Tasks.Task CompleteOAuthCallback_WithValidStateNonce_SucceedsAndConsumesNonce()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // 1. Get secure auth url with state nonce
        var authUrlRes = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/auth-url");
        var authUrlData = await authUrlRes.Content.ReadFromJsonAsync<ApiResponse<Ga4AuthUrlDto>>();
        var state = authUrlData!.Data!.State;

        // 2. Complete callback
        var body = new CompleteGa4OAuthCallbackRequest("valid_auth_code_123", "http://localhost:3000/callback", state);
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/callback", body);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var rawJson = await response.Content.ReadAsStringAsync();
        rawJson.Should().NotContain("mock_refresh_token");
        rawJson.Should().NotContain("encryptedRefreshToken");

        // 3. Replay attack with same state must be rejected with 400
        var replayResponse = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/callback", body);
        replayResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async System.Threading.Tasks.Task CompleteOAuthCallback_WithTamperedState_IsRejectedWithBadRequest()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var body = new CompleteGa4OAuthCallbackRequest("valid_auth_code_123", "http://localhost:3000/callback", "tampered_forged_state");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/callback", body);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async System.Threading.Tasks.Task DisconnectGa4_AsSuperAdmin_Succeeds()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var response = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/settings/integrations/ga4/disconnect", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<bool>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
    }

    [Fact]
    public async System.Threading.Tasks.Task DisconnectGa4_AsSEOExecutive_ReturnsForbidden()
    {
        // Disconnect endpoint requires SuperAdmin policy!
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/settings/integrations/ga4/disconnect", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetOverview_AsViewer_ReturnsOverviewMetrics()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/ga4/overview");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<Ga4OverviewDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.TotalSessions.Should().BeGreaterThan(0);
        result.Data.TotalActiveUsers.Should().BeGreaterThan(0);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetPages_AsMember_ReturnsPaginatedPages()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/integrations/ga4/pages?page=1&pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<Ga4PageRowDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.Items.Should().NotBeEmpty();
    }
}
