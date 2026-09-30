using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Rankings;

public class RankingsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RankingsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedRankData();
    }

    private void SeedRankData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var kw = db.Keywords.FirstOrDefault(k => k.ProjectId == CustomWebApplicationFactory.ProjectAId);
        if (kw == null)
        {
            kw = new Keyword
            {
                Id = Guid.NewGuid(),
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                KeywordText = "test ranking keyword",
                SearchEngine = "google",
                CountryCode = "US",
                Device = "desktop",
                TargetUrl = "https://alpha.company.com/page",
                SearchIntent = "Commercial",
                CreatedBy = CustomWebApplicationFactory.AdminUserId
            };
            db.Keywords.Add(kw);
            db.SaveChanges();
        }

        if (!db.RankResults.Any(r => r.KeywordId == kw.Id))
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.RankResults.AddRange(
                new RankResult
                {
                    KeywordId = kw.Id,
                    ProjectId = CustomWebApplicationFactory.ProjectAId,
                    CheckDate = today,
                    Position = 3,
                    PreviousPosition = 5,
                    PositionChange = 2,
                    RankedUrl = "https://alpha.company.com/page",
                    IsTargetUrlMatched = true,
                    ProviderName = "development",
                    RecordedAt = DateTimeOffset.UtcNow
                },
                new RankResult
                {
                    KeywordId = kw.Id,
                    ProjectId = CustomWebApplicationFactory.ProjectAId,
                    CheckDate = today.AddDays(-1),
                    Position = 5,
                    PreviousPosition = 6,
                    PositionChange = 1,
                    RankedUrl = "https://alpha.company.com/page",
                    IsTargetUrlMatched = true,
                    ProviderName = "development",
                    RecordedAt = DateTimeOffset.UtcNow.AddDays(-1)
                }
            );
            db.SaveChanges();
        }
    }

    [Fact]
    public async Task GetRankingsOverview_AsSuperAdmin_Returns200WithCalculatedMetrics()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/overview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsOverviewDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.TotalTrackedKeywords.Should().BeGreaterThan(0);
        content.Data.Trend.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRankingsOverview_AsSEOExecutive_AssignedProject_Returns200()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/overview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsOverviewDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task GetRankingsOverview_AsSEOExecutive_UnassignedProject_Returns403Forbidden()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        // Act - Attempt to access Project B where SEO Exec is NOT a member
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/rankings/overview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetRankingsOverview_AsViewer_AssignedProject_Returns200()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/overview");

        // Assert - Viewer is allowed read-only access to rankings
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsOverviewDto>>();
        content!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task GetLatestRankings_Returns200WithRankData()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/latest");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<KeywordRankDto>>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetKeywordHistory_EnforcesCrossProjectBoundary()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        var nonExistentKeywordId = Guid.NewGuid();

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/history/{nonExistentKeywordId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetRankingsOverview_Unauthenticated_Returns401Unauthorized()
    {
        // Arrange
        var unauthenticatedClient = _factory.CreateClient();

        // Act
        var response = await unauthenticatedClient.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/overview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetRankingsSummary_AsSuperAdmin_Returns200WithFullMetrics()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/summary?days=30");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsSummaryDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.TotalKeywordsTracked.Should().BeGreaterThan(0);
        content.Data.Distribution.Should().NotBeNull();
        content.Data.Movement.Should().NotBeNull();
        content.Data.AlgorithmNotes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRankingsDetailed_AsSuperAdmin_Returns200WithFullMetrics()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/detailed?positionFilter=all&pageSize=50");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsDetailedResponseDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.Header.Should().NotBeNull();
        content.Data.Header.All.Count.Should().BeGreaterThan(0);
        content.Data.Keywords.Should().NotBeNull();
        content.Data.Keywords.Items.Should().NotBeEmpty();
        content.Data.HistoryDates.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRankingsHistorical_AsSuperAdmin_Returns200WithFullMetrics()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");

        // Act
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/rankings/historical?positionFilter=all&pageSize=50");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<RankingsHistoricalResponseDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.DateFrom.Should().NotBeNullOrEmpty();
        content.Data.DateTo.Should().NotBeNullOrEmpty();
        content.Data.Header.Should().NotBeNull();
        content.Data.Metrics.Should().NotBeNull();
        content.Data.Keywords.Should().NotBeNull();
        content.Data.Keywords.Items.Should().NotBeEmpty();
        content.Data.Trajectory.Should().NotBeNull();
    }
}

