using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Dashboard.Queries;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class DashboardQueryTests
{
    private readonly ApplicationDbContext _context;

    public DashboardQueryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"DashboardDb_{Guid.NewGuid():N}")
            .Options;

        _context = new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetProjectDashboardQuery_WithPopulatedData_ReturnsAccurateMetrics()
    {
        var projectId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Project
        var project = new Project
        {
            Id = projectId,
            Name = "Acme Corp SEO",
            PrimaryDomain = "acme.com",
            CountryCode = "USA",
            DefaultSearchEngine = "Google",
            DefaultDevice = "Desktop",
            LanguageCode = "en",
            Timezone = "UTC",
            Status = ProjectStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Projects.Add(project);

        // Crawl Run
        var crawlRun = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Status = "Completed",
            HealthScore = 92m,
            UrlsCrawled = 450,
            ErrorsCount = 2,
            WarningsCount = 8,
            NoticesCount = 15,
            CompletedAt = DateTimeOffset.UtcNow.AddHours(-3),
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-4)
        };
        _context.CrawlRuns.Add(crawlRun);

        // Keywords & Rank Results
        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "seo tools", TargetUrl = "/tools" };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "rank tracker", TargetUrl = "/rank" };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "crawler audit", TargetUrl = "/audit" };
        _context.Keywords.AddRange(kw1, kw2, kw3);

        _context.RankResults.AddRange(
            new RankResult { Id = 1, ProjectId = projectId, KeywordId = kw1.Id, CheckDate = today, Position = 2, PreviousPosition = 5, PositionChange = 3, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 2, ProjectId = projectId, KeywordId = kw2.Id, CheckDate = today, Position = 8, PreviousPosition = 6, PositionChange = -2, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 3, ProjectId = projectId, KeywordId = kw3.Id, CheckDate = today, Position = 18, PreviousPosition = 18, PositionChange = 0, RecordedAt = DateTimeOffset.UtcNow }
        );

        // GSC Connection & Daily Metrics
        _context.GoogleConnections.Add(new GoogleConnection
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            ServiceType = GoogleConstants.ServiceTypes.Gsc,
            PropertyIdentifier = "sc-domain:acme.com",
            AccountEmail = "seo@acme.com",
            EncryptedRefreshToken = "enc_token",
            SyncStatus = GoogleConstants.SyncStatuses.Active,
            LastSyncedAt = DateTimeOffset.UtcNow.AddHours(-2)
        });

        _context.GscDailyMetrics.AddRange(
            new GscDailyMetric { ProjectId = projectId, MetricDate = today.AddDays(-2), Device = "ALL", Clicks = 1200, Impressions = 20000, Ctr = 0.06m, AveragePosition = 4.5m },
            new GscDailyMetric { ProjectId = projectId, MetricDate = today.AddDays(-1), Device = "ALL", Clicks = 1400, Impressions = 22000, Ctr = 0.0636m, AveragePosition = 4.2m }
        );

        // Audit Issues
        _context.AuditIssues.Add(new AuditIssue
        {
            Id = Guid.NewGuid(),
            CrawlRunId = crawlRun.Id,
            ProjectId = projectId,
            RuleCode = "BROKEN_LINK_404",
            Severity = "Error",
            AffectedUrl = "https://acme.com/missing-page",
            Status = "Open",
            FirstSeenAt = DateTimeOffset.UtcNow.AddDays(-1)
        });

        // Tasks
        _context.Tasks.AddRange(
            new TaskItem { Id = Guid.NewGuid(), ProjectId = projectId, Title = "Fix 404", Status = "Open", Priority = "High", DueDate = today.AddDays(-1), CreatedBy = Guid.NewGuid() },
            new TaskItem { Id = Guid.NewGuid(), ProjectId = projectId, Title = "Update Meta", Status = "InProgress", Priority = "Medium", DueDate = today.AddDays(5), CreatedBy = Guid.NewGuid() },
            new TaskItem { Id = Guid.NewGuid(), ProjectId = projectId, Title = "Redirect Old URL", Status = "Closed", Priority = "Low", DueDate = today.AddDays(-3), CreatedBy = Guid.NewGuid() }
        );

        await _context.SaveChangesAsync();

        var handler = new GetProjectDashboardQueryHandler(_context);
        var result = await handler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        result.Success.Should().BeTrue();
        var data = result.Data;
        data.Should().NotBeNull();
        data!.ProjectId.Should().Be(projectId);
        data.PrimaryDomain.Should().Be("acme.com");

        // 1. Health
        data.Health.HealthScore.Should().Be(92m);
        data.Health.TotalUrlsCrawled.Should().Be(450);
        data.Health.ErrorsCount.Should().Be(2);

        // 2. Rankings
        data.Rankings.TotalKeywords.Should().Be(3);
        data.Rankings.AveragePosition.Should().Be(9.3m);
        data.Rankings.Top3Count.Should().Be(1);
        data.Rankings.Top10Count.Should().Be(2);
        data.Rankings.Top20Count.Should().Be(3);
        data.Rankings.Top100Count.Should().Be(3);
        data.Rankings.ImprovedCount.Should().Be(1);
        data.Rankings.DeclinedCount.Should().Be(1);
        data.Rankings.UnchangedCount.Should().Be(1);

        // 3. GSC
        data.Gsc.TotalClicks.Should().Be(2600);
        data.Gsc.TotalImpressions.Should().Be(42000);
        data.Gsc.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Active);

        // 4. Critical Issues
        data.CriticalIssues.Should().HaveCount(1);
        data.CriticalIssues[0].RuleCode.Should().Be("BROKEN_LINK_404");

        // 5. Tasks
        data.Tasks.OpenCount.Should().Be(1);
        data.Tasks.InProgressCount.Should().Be(1);
        data.Tasks.ClosedCount.Should().Be(1);
        data.Tasks.OverdueCount.Should().Be(1);
        data.Tasks.TotalCount.Should().Be(3);

        // 6. Freshness
        data.Freshness.LastRankCheckAt.Should().NotBeNull();
        data.Freshness.LastAuditCrawlAt.Should().NotBeNull();
        data.Freshness.LastGscSyncAt.Should().NotBeNull();
    }

    [Fact]
    public async Task GetProjectDashboardQuery_WithEmptyProject_ReturnsEmptyOnboardingMetrics()
    {
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = "Empty Workspace",
            PrimaryDomain = "empty.example.com",
            CountryCode = "USA",
            DefaultSearchEngine = "Google",
            DefaultDevice = "Desktop",
            LanguageCode = "en",
            Timezone = "UTC",
            Status = ProjectStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        var handler = new GetProjectDashboardQueryHandler(_context);
        var result = await handler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        result.Success.Should().BeTrue();
        var data = result.Data;
        data.Should().NotBeNull();
        data!.Health.HealthScore.Should().BeNull();
        data.Health.TotalUrlsCrawled.Should().Be(0);
        data.Rankings.TotalKeywords.Should().Be(0);
        data.Rankings.AveragePosition.Should().BeNull();
        data.Gsc.TotalClicks.Should().Be(0);
        data.Gsc.SyncStatus.Should().Be(GoogleConstants.SyncStatuses.Disconnected);
        data.CriticalIssues.Should().BeEmpty();
        data.Tasks.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetProjectDashboardQuery_WithNonExistentProject_ThrowsNotFoundException()
    {
        var handler = new GetProjectDashboardQueryHandler(_context);
        var act = () => handler.Handle(new GetProjectDashboardQuery(Guid.NewGuid()), CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetGlobalDashboardQuery_AsSuperAdmin_ReturnsAllProjects()
    {
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.Setup(s => s.IsSuperAdmin).Returns(true);
        currentUserServiceMock.Setup(s => s.UserId).Returns(Guid.NewGuid());

        var p1 = new Project { Id = Guid.NewGuid(), Name = "Proj 1", PrimaryDomain = "p1.com", CountryCode = "USA", DefaultSearchEngine = "Google", DefaultDevice = "Desktop", LanguageCode = "en", Timezone = "UTC", Status = ProjectStatus.Active };
        var p2 = new Project { Id = Guid.NewGuid(), Name = "Proj 2", PrimaryDomain = "p2.com", CountryCode = "USA", DefaultSearchEngine = "Google", DefaultDevice = "Desktop", LanguageCode = "en", Timezone = "UTC", Status = ProjectStatus.Active };
        _context.Projects.AddRange(p1, p2);
        await _context.SaveChangesAsync();

        var handler = new GetGlobalDashboardQueryHandler(_context, currentUserServiceMock.Object);
        var result = await handler.Handle(new GetGlobalDashboardQuery(), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalProjects.Should().Be(2);
        result.Data.Projects.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetGlobalDashboardQuery_AsRegularUser_ReturnsOnlyAssignedProjects()
    {
        var userId = Guid.NewGuid();
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.Setup(s => s.IsSuperAdmin).Returns(false);
        currentUserServiceMock.Setup(s => s.UserId).Returns(userId);

        var p1 = new Project { Id = Guid.NewGuid(), Name = "Assigned Proj", PrimaryDomain = "assigned.com", CountryCode = "USA", DefaultSearchEngine = "Google", DefaultDevice = "Desktop", LanguageCode = "en", Timezone = "UTC", Status = ProjectStatus.Active };
        var p2 = new Project { Id = Guid.NewGuid(), Name = "Unassigned Proj", PrimaryDomain = "unassigned.com", CountryCode = "USA", DefaultSearchEngine = "Google", DefaultDevice = "Desktop", LanguageCode = "en", Timezone = "UTC", Status = ProjectStatus.Active };
        _context.Projects.AddRange(p1, p2);

        _context.ProjectMembers.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = p1.Id,
            UserId = userId
        });

        await _context.SaveChangesAsync();

        var handler = new GetGlobalDashboardQueryHandler(_context, currentUserServiceMock.Object);
        var result = await handler.Handle(new GetGlobalDashboardQuery(), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalProjects.Should().Be(1);
        result.Data.Projects[0].Name.Should().Be("Assigned Proj");
    }

    [Fact]
    public async Task AuditHealthScore_Equals_DashboardHealthScore_PopulatedCrawl()
    {
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Audit Parity Proj", PrimaryDomain = "auditparity.com" };
        _context.Projects.Add(project);

        var crawl = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Status = "Completed",
            UrlsCrawled = 100,
            ErrorsCount = 4,
            WarningsCount = 6,
            NoticesCount = 10,
            HealthScore = 91.0m, // 100 - ((4 * 1.5 + 6 * 0.5) / 100 * 100) = 100 - 9 = 91.0
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.CrawlRuns.Add(crawl);
        await _context.SaveChangesAsync();

        var auditHandler = new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQueryHandler(_context);
        var dashboardHandler = new GetProjectDashboardQueryHandler(_context);

        var auditRes = await auditHandler.Handle(new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQuery(projectId), CancellationToken.None);
        var dashRes = await dashboardHandler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        auditRes.Data!.HealthScore.Should().Be(91.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(91.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(auditRes.Data!.HealthScore);
    }

    [Fact]
    public async Task AuditHealthScore_Equals_DashboardHealthScore_ZeroIssues()
    {
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Zero Issues Proj", PrimaryDomain = "zeroissues.com" };
        _context.Projects.Add(project);

        var crawl = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Status = "Completed",
            UrlsCrawled = 50,
            ErrorsCount = 0,
            WarningsCount = 0,
            NoticesCount = 5,
            HealthScore = 100.0m,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.CrawlRuns.Add(crawl);
        await _context.SaveChangesAsync();

        var auditHandler = new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQueryHandler(_context);
        var dashboardHandler = new GetProjectDashboardQueryHandler(_context);

        var auditRes = await auditHandler.Handle(new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQuery(projectId), CancellationToken.None);
        var dashRes = await dashboardHandler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        auditRes.Data!.HealthScore.Should().Be(100.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(100.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(auditRes.Data!.HealthScore);
    }

    [Fact]
    public async Task AuditHealthScore_Equals_DashboardHealthScore_ErrorsAndWarnings()
    {
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Penalty Proj", PrimaryDomain = "penalty.com" };
        _context.Projects.Add(project);

        var crawl = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Status = "Completed",
            UrlsCrawled = 20,
            ErrorsCount = 10,
            WarningsCount = 10,
            NoticesCount = 20,
            HealthScore = 0.0m, // 100 - ((10*1.5 + 10*0.5)/20 * 100) = 100 - 100 = 0.0
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.CrawlRuns.Add(crawl);
        await _context.SaveChangesAsync();

        var auditHandler = new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQueryHandler(_context);
        var dashboardHandler = new GetProjectDashboardQueryHandler(_context);

        var auditRes = await auditHandler.Handle(new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQuery(projectId), CancellationToken.None);
        var dashRes = await dashboardHandler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        auditRes.Data!.HealthScore.Should().Be(0.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(0.0m);
        dashRes.Data!.Health.HealthScore.Should().Be(auditRes.Data!.HealthScore);
    }

    [Fact]
    public async Task AuditHealthScore_Equals_DashboardHealthScore_ZeroCrawledUrls()
    {
        var projectId = Guid.NewGuid();
        var project = new Project { Id = projectId, Name = "Zero Crawl Proj", PrimaryDomain = "zerocrawl.com" };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        var auditHandler = new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQueryHandler(_context);
        var dashboardHandler = new GetProjectDashboardQueryHandler(_context);

        var auditRes = await auditHandler.Handle(new InternalSEO.Application.Features.Audit.Queries.GetAuditOverviewQuery(projectId), CancellationToken.None);
        var dashRes = await dashboardHandler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        auditRes.Data!.HealthScore.Should().BeNull();
        dashRes.Data!.Health.HealthScore.Should().BeNull();
        dashRes.Data!.Health.HealthScore.Should().Be(auditRes.Data!.HealthScore);
    }

    [Fact]
    public async Task RankingsSearchVisibility_Equals_DashboardSearchVisibility()
    {
        var projectId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var project = new Project { Id = projectId, Name = "Rankings Parity Proj", PrimaryDomain = "rankingsparity.com" };
        _context.Projects.Add(project);

        var kw1 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "k1", TargetUrl = "/1" };
        var kw2 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "k2", TargetUrl = "/2" };
        var kw3 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "k3", TargetUrl = "/3" };
        var kw4 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "k4", TargetUrl = "/4" };
        var kw5 = new Keyword { Id = Guid.NewGuid(), ProjectId = projectId, KeywordText = "k5", TargetUrl = "/5" };
        _context.Keywords.AddRange(kw1, kw2, kw3, kw4, kw5);

        // Positions: 1 (31.7), 2 (24.7), 5 (9.5), 10 (3.5), 50 (0.1)
        // Total CTR = 31.7 + 24.7 + 9.5 + 3.5 + 0.1 = 69.5
        // Visibility = 69.5 / 5 = 13.9
        _context.RankResults.AddRange(
            new RankResult { Id = 101, ProjectId = projectId, KeywordId = kw1.Id, CheckDate = today, Position = 1, PreviousPosition = 2, PositionChange = 1, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 102, ProjectId = projectId, KeywordId = kw2.Id, CheckDate = today, Position = 2, PreviousPosition = 3, PositionChange = 1, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 103, ProjectId = projectId, KeywordId = kw3.Id, CheckDate = today, Position = 5, PreviousPosition = 5, PositionChange = 0, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 104, ProjectId = projectId, KeywordId = kw4.Id, CheckDate = today, Position = 10, PreviousPosition = 12, PositionChange = 2, RecordedAt = DateTimeOffset.UtcNow },
            new RankResult { Id = 105, ProjectId = projectId, KeywordId = kw5.Id, CheckDate = today, Position = 50, PreviousPosition = 50, PositionChange = 0, RecordedAt = DateTimeOffset.UtcNow }
        );
        await _context.SaveChangesAsync();

        var rankingsHandler = new InternalSEO.Application.Features.Rankings.Queries.GetRankingsOverviewQueryHandler(_context);
        var dashboardHandler = new GetProjectDashboardQueryHandler(_context);

        var rankingsRes = await rankingsHandler.Handle(new InternalSEO.Application.Features.Rankings.Queries.GetRankingsOverviewQuery(projectId), CancellationToken.None);
        var dashRes = await dashboardHandler.Handle(new GetProjectDashboardQuery(projectId), CancellationToken.None);

        rankingsRes.Data!.SearchVisibility.Should().Be(13.9m);
        dashRes.Data!.Rankings.SearchVisibility.Should().Be(13.9m);
        dashRes.Data!.Rankings.SearchVisibility.Should().Be(rankingsRes.Data!.SearchVisibility);
    }
}

