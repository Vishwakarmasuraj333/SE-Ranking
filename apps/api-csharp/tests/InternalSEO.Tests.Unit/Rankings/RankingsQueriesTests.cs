using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Features.Rankings.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Tests.Unit.Common;
using Xunit;

namespace InternalSEO.Tests.Unit.Rankings;

public class RankingsQueriesTests
{
    [Fact]
    public async Task GetRankingsOverview_CalculatesMetricsCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Rankings Test Project",
            PrimaryDomain = "test.company.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "best enterprise seo", CreatedBy = userId };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "seo tooling", CreatedBy = userId };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "serp rank tracker", CreatedBy = userId };
        var kw4 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "unranked term", CreatedBy = userId };
        context.Keywords.AddRange(kw1, kw2, kw3, kw4);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // kw1: pos 3, prev 5 (improved)
        // kw2: pos 8, prev 8 (no change)
        // kw3: pos 25, prev 20 (declined)
        // kw4: unranked (null)
        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 3, PreviousPosition = 5, PositionChange = 2 },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = today, Position = 8, PreviousPosition = 8, PositionChange = 0 },
            new RankResult { KeywordId = kw3.Id, ProjectId = project.Id, CheckDate = today, Position = 25, PreviousPosition = 20, PositionChange = -5 },
            new RankResult { KeywordId = kw4.Id, ProjectId = project.Id, CheckDate = today, Position = null, PreviousPosition = null, PositionChange = null }
        );
        await context.SaveChangesAsync();

        var handler = new GetRankingsOverviewQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsOverviewQuery(project.Id, "week"), default);

        // Assert
        response.Success.Should().BeTrue();
        var data = response.Data!;
        data.TotalTrackedKeywords.Should().Be(4);
        data.Top5Count.Should().Be(1);  // pos 3
        data.Top10Count.Should().Be(2); // pos 3, 8
        data.Top30Count.Should().Be(3); // pos 3, 8, 25
        data.AveragePosition.Should().Be(12.0m); // (3 + 8 + 25) / 3 = 36 / 3 = 12.0
        data.Top10Percentage.Should().Be(50.0m); // 2 / 4 = 50%
        data.Top5Keywords.Should().HaveCount(1);
        data.Top5Keywords[0].Keyword.Should().Be("best enterprise seo");
        data.Top5Keywords[0].Position.Should().Be(3);
        data.Trend.Should().HaveCount(7);
    }

    [Fact]
    public async Task GetRankingsOverview_EmptyProject_ReturnsGracefulEmptyState()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Empty Project",
            PrimaryDomain = "empty.example.com",
            CreatedBy = Guid.NewGuid()
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new GetRankingsOverviewQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsOverviewQuery(project.Id), default);

        // Assert
        response.Success.Should().BeTrue();
        response.Data!.TotalTrackedKeywords.Should().Be(0);
        response.Data!.AveragePosition.Should().BeNull();
        response.Data!.Top5Count.Should().Be(0);
    }

    [Fact]
    public async Task GetKeywordRankingHistory_EnforcesProjectIsolation()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var projectA = new Project { Id = Guid.NewGuid(), Name = "Project A", PrimaryDomain = "a.com", CreatedBy = Guid.NewGuid() };
        var projectB = new Project { Id = Guid.NewGuid(), Name = "Project B", PrimaryDomain = "b.com", CreatedBy = Guid.NewGuid() };
        context.Projects.AddRange(projectA, projectB);

        var keywordB = new Keyword { Id = Guid.NewGuid(), ProjectId = projectB.Id, KeywordText = "keyword in project B", CreatedBy = Guid.NewGuid() };
        context.Keywords.Add(keywordB);
        await context.SaveChangesAsync();

        var handler = new GetKeywordRankingHistoryQueryHandler(context);

        // Act - Attempt to access Project B's keyword via Project A's route
        var act = async () => await handler.Handle(new GetKeywordRankingHistoryQuery(projectA.Id, keywordB.Id), default);

        // Assert - Must throw NotFoundException due to project boundary mismatch
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetLatestRankings_ReturnsLatestObservationPerKeyword()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var project = new Project { Id = Guid.NewGuid(), Name = "Project", PrimaryDomain = "example.com", CreatedBy = Guid.NewGuid() };
        context.Projects.Add(project);

        var kw = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "rank check", Device = "desktop", CreatedBy = Guid.NewGuid() };
        context.Keywords.Add(kw);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        context.RankResults.AddRange(
            new RankResult { KeywordId = kw.Id, ProjectId = project.Id, CheckDate = yesterday, Position = 10 },
            new RankResult { KeywordId = kw.Id, ProjectId = project.Id, CheckDate = today, Position = 7, PreviousPosition = 10, PositionChange = 3 }
        );
        await context.SaveChangesAsync();

        var handler = new GetLatestRankingsQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetLatestRankingsQuery(project.Id), default);

        // Assert
        response.Success.Should().BeTrue();
        response.Data!.Items.Should().HaveCount(1);
        var item = response.Data!.Items.First();
        item.CurrentPosition.Should().Be(7);
        item.PreviousPosition.Should().Be(10);
        item.PositionChange.Should().Be(3);
    }

    [Fact]
    public async Task GetRankingsSummary_CalculatesBucketsMovementsAndPreviewsCorrectly()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Summary Project",
            PrimaryDomain = "primary.company.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var competitor = new Competitor
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Name = "Rival Corp",
            Domain = "rival.com"
        };
        context.Competitors.Add(competitor);

        // Keywords in various buckets
        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "seo platform", MonthlySearchVolume = 5000, CreatedBy = userId }; // Pos 1 (Top 1)
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "rank tracker", MonthlySearchVolume = 3000, CreatedBy = userId };  // Pos 3 (Top 2-3)
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "serp tool", MonthlySearchVolume = 1200, CreatedBy = userId };     // Pos 5 (Top 4-5)
        var kw4 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "audit software", MonthlySearchVolume = 800, CreatedBy = userId }; // Pos 9 (Top 6-10)
        var kw5 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "backlink tool", MonthlySearchVolume = 400, CreatedBy = userId };  // Pos 15 (Top 11-30)
        var kw6 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "competitor tool", MonthlySearchVolume = 200, CreatedBy = userId };// Pos 45 (Top 31-100)
        var kw7 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "unranked query", MonthlySearchVolume = 100, CreatedBy = userId }; // Unranked (>100)
        context.Keywords.AddRange(kw1, kw2, kw3, kw4, kw5, kw6, kw7);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        // Primary rank results
        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 1, PreviousPosition = 2, PositionChange = 1, RankedUrl = "https://primary.company.com/seo" },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = today, Position = 3, PreviousPosition = 5, PositionChange = 2, RankedUrl = "https://primary.company.com/seo" },
            new RankResult { KeywordId = kw3.Id, ProjectId = project.Id, CheckDate = today, Position = 5, PreviousPosition = 4, PositionChange = -1, RankedUrl = "https://primary.company.com/tools" },
            new RankResult { KeywordId = kw4.Id, ProjectId = project.Id, CheckDate = today, Position = 9, PreviousPosition = 9, PositionChange = 0, RankedUrl = "https://primary.company.com/audit" },
            new RankResult { KeywordId = kw5.Id, ProjectId = project.Id, CheckDate = today, Position = 15, PreviousPosition = 20, PositionChange = 5, RankedUrl = "https://primary.company.com/tools" },
            new RankResult { KeywordId = kw6.Id, ProjectId = project.Id, CheckDate = today, Position = 45, PreviousPosition = 40, PositionChange = -5, RankedUrl = "https://primary.company.com/audit" },
            new RankResult { KeywordId = kw7.Id, ProjectId = project.Id, CheckDate = today, Position = null, PreviousPosition = null, PositionChange = null }
        );

        // Competitor rank results
        context.CompetitorRankResults.AddRange(
            new CompetitorRankResult { CompetitorId = competitor.Id, KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 4 },
            new CompetitorRankResult { CompetitorId = competitor.Id, KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = today, Position = 2 }
        );

        await context.SaveChangesAsync();

        var handler = new GetRankingsSummaryQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsSummaryQuery(project.Id, 30), default);

        // Assert
        response.Success.Should().BeTrue();
        var data = response.Data!;
        data.TotalKeywordsTracked.Should().Be(7);
        data.TotalKeywordsInSerp.Should().Be(6); // kw1..kw6
        data.Distribution.Top1.Should().Be(1);
        data.Distribution.Top2_3.Should().Be(1);
        data.Distribution.Top4_5.Should().Be(1);
        data.Distribution.Top6_10.Should().Be(1);
        data.Distribution.Top11_30.Should().Be(1);
        data.Distribution.Top31_100.Should().Be(1);
        data.Distribution.GreaterThan100.Should().Be(1);

        // SERP movement
        // Jumped: kw1 (+1), kw2 (+2), kw5 (+5) => 3
        // Dropped: kw3 (-1), kw6 (-5) => 2
        // Unchanged: kw4 (0), kw7 (0) => 2
        data.Movement.JumpedCount.Should().Be(3);
        data.Movement.DroppedCount.Should().Be(2);
        data.Movement.UnchangedCount.Should().Be(2);

        // Previews
        data.TopKeywords.Should().HaveCount(5);
        data.TopKeywords[0].Position.Should().Be(1);
        data.JumpedKeywords.Should().HaveCount(3);
        data.DroppedKeywords.Should().HaveCount(2);

        // Pages
        data.TopPages.Should().NotBeEmpty();
        data.TopPages.First().TotalKeywords.Should().Be(2); // "https://primary.company.com/seo" or "tools" or "audit"

        // Competitors
        data.Competitors.Should().HaveCount(1);
        data.Competitors[0].Name.Should().Be("Rival Corp");
        data.Competitors[0].SearchVisibility.Should().BeGreaterThan(0m);
    }

    [Fact]
    public async Task GetRankingsSummary_EmptyProject_ReturnsGracefulDefaults()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Empty Project",
            PrimaryDomain = "empty.example.com",
            CreatedBy = Guid.NewGuid()
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new GetRankingsSummaryQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsSummaryQuery(project.Id, 30), default);

        // Assert
        response.Success.Should().BeTrue();
        response.Data!.TotalKeywordsTracked.Should().Be(0);
        response.Data!.TotalKeywordsInSerp.Should().Be(0);
        response.Data!.SearchVisibility.Should().Be(0m);
        response.Data!.AveragePosition.Should().BeNull();
        response.Data!.Distribution.Top1.Should().Be(0);
        response.Data!.AlgorithmNotes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRankingsDetailed_CalculatesPositionDistributionBucketsAndMovement()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Detailed Test Project",
            PrimaryDomain = "detailed.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "pos 1 term", CreatedBy = userId, MonthlySearchVolume = 1200 };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "pos 3 term", CreatedBy = userId, MonthlySearchVolume = 800 };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "pos 5 term", CreatedBy = userId, MonthlySearchVolume = 650 };
        var kw4 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "pos 9 term", CreatedBy = userId, MonthlySearchVolume = 400 };
        var kw5 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "pos 22 term", CreatedBy = userId, MonthlySearchVolume = 300 };
        var kw6 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "unranked term", CreatedBy = userId, MonthlySearchVolume = 100 };
        context.Keywords.AddRange(kw1, kw2, kw3, kw4, kw5, kw6);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 1, PreviousPosition = 2, PositionChange = 1, RankedUrl = "https://detailed.example.com/pos1" },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = today, Position = 3, PreviousPosition = 3, PositionChange = 0, RankedUrl = "https://detailed.example.com/pos3" },
            new RankResult { KeywordId = kw3.Id, ProjectId = project.Id, CheckDate = today, Position = 5, PreviousPosition = 4, PositionChange = -1, RankedUrl = "https://detailed.example.com/pos5" },
            new RankResult { KeywordId = kw4.Id, ProjectId = project.Id, CheckDate = today, Position = 9, PreviousPosition = 12, PositionChange = 3, RankedUrl = "https://detailed.example.com/pos9" },
            new RankResult { KeywordId = kw5.Id, ProjectId = project.Id, CheckDate = today, Position = 22, PreviousPosition = 22, PositionChange = 0, RankedUrl = "https://detailed.example.com/pos22" },
            new RankResult { KeywordId = kw6.Id, ProjectId = project.Id, CheckDate = today, Position = null, PreviousPosition = null, PositionChange = null }
        );
        await context.SaveChangesAsync();

        var handler = new GetRankingsDetailedQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsDetailedQuery(project.Id), default);

        // Assert
        response.Success.Should().BeTrue();
        var data = response.Data!;
        data.Header.All.Count.Should().Be(6);
        data.Header.Top1.Count.Should().Be(1);
        data.Header.Top3.Count.Should().Be(2); // pos 1, 3
        data.Header.Top5.Count.Should().Be(3); // pos 1, 3, 5
        data.Header.Top10.Count.Should().Be(4); // pos 1, 3, 5, 9
        data.Header.Top30.Count.Should().Be(5); // pos 1, 3, 5, 9, 22
        data.Header.Over100.Count.Should().Be(1); // unranked

        data.Header.JumpedCount.Should().Be(2); // posChange 1 and 3
        data.Header.DroppedCount.Should().Be(1); // posChange -1

        data.Keywords.Items.Should().HaveCount(6);
        data.Keywords.Items.First().CurrentPosition.Should().Be(1);
        data.Keywords.Items.First().ContentScore.Should().NotBeNull();
        data.Keywords.Items.First().DailyPositions.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRankingsDetailed_DetectsCannibalizationAndReturnsInsights()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Cannibalization Project",
            PrimaryDomain = "cannibal.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "competing query", CreatedBy = userId };
        context.Keywords.Add(kw1);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var prevDate = today.AddDays(-2);

        // Keyword ranks with URL A today, but ranked with URL B previously -> Cannibalization detected!
        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 7, PreviousPosition = 9, PositionChange = 2, RankedUrl = "https://cannibal.example.com/blog/article-1" },
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = prevDate, Position = 9, PreviousPosition = 12, PositionChange = 3, RankedUrl = "https://cannibal.example.com/products/item-2" }
        );
        await context.SaveChangesAsync();

        var handler = new GetRankingsDetailedQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsDetailedQuery(project.Id), default);

        // Assert
        response.Success.Should().BeTrue();
        response.Data!.Insights.Should().ContainSingle(i => i.Type == "SERP Changes");
        response.Data!.Insights[0].AffectedKeywordIds.Should().Contain(kw1.Id);
        response.Data!.Keywords.Items.First().IsCannibalized.Should().BeTrue();

        // Act with CannibalizedOnly filter
        var filteredResponse = await handler.Handle(new GetRankingsDetailedQuery(project.Id, CannibalizedOnly: true), default);
        filteredResponse.Data!.Keywords.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetRankingsDetailed_AppliesPositionFiltersAndPagination()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Filter Test Project",
            PrimaryDomain = "filter.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "alpha", CreatedBy = userId };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "beta", CreatedBy = userId };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "gamma", CreatedBy = userId };
        context.Keywords.AddRange(kw1, kw2, kw3);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = today, Position = 2, PositionChange = 1 },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = today, Position = 8, PositionChange = -2 },
            new RankResult { KeywordId = kw3.Id, ProjectId = project.Id, CheckDate = today, Position = 35, PositionChange = 0 }
        );
        await context.SaveChangesAsync();

        var handler = new GetRankingsDetailedQueryHandler(context);

        // Filter top3
        var top3Res = await handler.Handle(new GetRankingsDetailedQuery(project.Id, PositionFilter: "top3"), default);
        top3Res.Data!.Keywords.Items.Should().HaveCount(1);
        top3Res.Data!.Keywords.Items.First().KeywordText.Should().Be("alpha");

        // Changes only up
        var upRes = await handler.Handle(new GetRankingsDetailedQuery(project.Id, ChangesOnly: "up"), default);
        upRes.Data!.Keywords.Items.Should().HaveCount(1);
        upRes.Data!.Keywords.Items.First().KeywordText.Should().Be("alpha");

        // Min/Max position
        var rangeRes = await handler.Handle(new GetRankingsDetailedQuery(project.Id, MinPosition: 5, MaxPosition: 10), default);
        rangeRes.Data!.Keywords.Items.Should().HaveCount(1);
        rangeRes.Data!.Keywords.Items.First().KeywordText.Should().Be("beta");
    }

    [Fact]
    public async Task GetRankingsHistorical_CalculatesComparisonMetricsAndDeltas()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Historical Test Project",
            PrimaryDomain = "historical.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "seo audit tool", CreatedBy = userId, MonthlySearchVolume = 1900 };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = project.Id, KeywordText = "rank tracking", CreatedBy = userId, MonthlySearchVolume = 590 };
        context.Keywords.AddRange(kw1, kw2);

        var dateBase = new DateOnly(2026, 8, 15);
        var dateCur = new DateOnly(2026, 9, 15);

        // kw1: was pos 5, now pos 2 (improved by +3)
        // kw2: was pos 15, now pos 18 (dropped by -3)
        context.RankResults.AddRange(
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = dateBase, Position = 5, RankedUrl = "https://historical.example.com/audit" },
            new RankResult { KeywordId = kw1.Id, ProjectId = project.Id, CheckDate = dateCur, Position = 2, RankedUrl = "https://historical.example.com/audit" },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = dateBase, Position = 15, RankedUrl = "https://historical.example.com/tracker" },
            new RankResult { KeywordId = kw2.Id, ProjectId = project.Id, CheckDate = dateCur, Position = 18, RankedUrl = "https://historical.example.com/tracker" }
        );
        await context.SaveChangesAsync();

        var handler = new GetRankingsHistoricalQueryHandler(context);

        // Act
        var response = await handler.Handle(new GetRankingsHistoricalQuery(project.Id, dateBase, dateCur), default);

        // Assert
        response.Success.Should().BeTrue();
        var data = response.Data!;
        data.DateFrom.Should().Be("2026-08-15");
        data.DateTo.Should().Be("2026-09-15");
        data.Header.All.Count.Should().Be(2);
        data.Header.Top3.Count.Should().Be(1); // pos 2
        data.Header.JumpedCount.Should().Be(1); // kw1 improved
        data.Header.DroppedCount.Should().Be(1); // kw2 dropped

        data.Metrics.AveragePosition.BaselineValue.Should().Be(10.0m); // (5 + 15) / 2 = 10.0
        data.Metrics.AveragePosition.CurrentValue.Should().Be(10.0m); // (2 + 18) / 2 = 10.0

        data.Keywords.Items.Should().HaveCount(2);
        var item1 = data.Keywords.Items.First(k => k.KeywordText == "seo audit tool");
        item1.BaselinePosition.Should().Be(5);
        item1.CurrentPosition.Should().Be(2);
        item1.PositionChange.Should().Be(3);
    }
}

