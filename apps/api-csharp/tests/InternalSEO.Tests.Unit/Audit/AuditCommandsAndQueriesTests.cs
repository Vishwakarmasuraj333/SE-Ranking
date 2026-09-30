using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Audit.Commands.StartCrawl;
using InternalSEO.Application.Features.Audit.Commands.UpdateCrawlSettings;
using InternalSEO.Application.Features.Audit.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Tests.Unit.Common;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Audit;

public class AuditCommandsAndQueriesTests
{
    private readonly Mock<ICrawlJobEnqueuer> _mockEnqueuer = new();
    private readonly Mock<ICurrentUserService> _mockUserService = new();
    private readonly Mock<IActivityLogger> _mockActivityLogger = new();

    public AuditCommandsAndQueriesTests()
    {
        _mockUserService.Setup(u => u.UserId).Returns(Guid.NewGuid());
    }

    [Fact]
    public async Task StartCrawlCommand_CreatesQueuedRun_AndEnqueuesJob()
    {
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Audit Test Project",
            PrimaryDomain = "test.company.com"
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        _mockEnqueuer.Setup(e => e.EnqueueCrawlJob(It.IsAny<Guid>())).Returns("hangfire-job-1");

        var handler = new StartCrawlCommandHandler(context, _mockEnqueuer.Object, _mockUserService.Object, _mockActivityLogger.Object);
        var result = await handler.Handle(new StartCrawlCommand(project.Id), default);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var run = context.CrawlRuns.FirstOrDefault(r => r.Id == result.Data);
        run.Should().NotBeNull();
        run!.Status.Should().Be("Queued");

        _mockEnqueuer.Verify(e => e.EnqueueCrawlJob(run.Id), Times.Once);
    }

    [Fact]
    public async Task StartCrawlCommand_ThrowsBadRequest_WhenCrawlAlreadyActive()
    {
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Active Crawl Project",
            PrimaryDomain = "test.company.com"
        };
        context.Projects.Add(project);
        context.CrawlRuns.Add(new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Status = "Crawling"
        });
        await context.SaveChangesAsync();

        var handler = new StartCrawlCommandHandler(context, _mockEnqueuer.Object, _mockUserService.Object, _mockActivityLogger.Object);
        
        var act = async () => await handler.Handle(new StartCrawlCommand(project.Id), default);
        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task UpdateCrawlSettingsCommand_UpdatesSettingsCorrectly()
    {
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Settings Test Project",
            PrimaryDomain = "test.company.com"
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new UpdateCrawlSettingsCommandHandler(context, _mockActivityLogger.Object);
        var command = new UpdateCrawlSettingsCommand(
            project.Id,
            CrawlMaxPages: 500,
            CrawlMaxDepth: 7,
            CrawlConcurrency: 3,
            CrawlRateLimitMs: 250,
            CrawlRespectRobotsTxt: false,
            CrawlUserAgent: "CustomSEOAuditBot/2.0"
        );

        var result = await handler.Handle(command, default);

        result.Success.Should().BeTrue();
        result.Data!.CrawlMaxPages.Should().Be(500);
        result.Data.CrawlMaxDepth.Should().Be(7);
        result.Data.CrawlRespectRobotsTxt.Should().BeFalse();
        result.Data.CrawlUserAgent.Should().Be("CustomSEOAuditBot/2.0");

        var dbSettings = context.ProjectSettings.FirstOrDefault(s => s.ProjectId == project.Id);
        dbSettings.Should().NotBeNull();
        dbSettings!.CrawlMaxPages.Should().Be(500);
    }

    [Fact]
    public async Task GetAuditOverviewQuery_ReturnsCorrectMetrics()
    {
        using var context = TestDbContextFactory.Create();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Overview Test Project",
            PrimaryDomain = "test.company.com"
        };
        context.Projects.Add(project);

        var completedRun = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Status = "Completed",
            UrlsCrawled = 42,
            ErrorsCount = 3,
            WarningsCount = 5,
            NoticesCount = 2,
            HealthScore = 88.5m,
            CreatedAt = DateTimeOffset.UtcNow
        };
        context.CrawlRuns.Add(completedRun);

        var rule = new AuditRule { Id = "RULE-HTTP-404", Title = "404", Category = "Indexability" };
        context.AuditRules.Add(rule);

        context.AuditIssues.Add(new AuditIssue
        {
            Id = Guid.NewGuid(),
            CrawlRunId = completedRun.Id,
            ProjectId = project.Id,
            RuleCode = rule.Id,
            Severity = "Error",
            AffectedUrl = "https://test.company.com/lost",
            AffectedUrlHash = "hash123"
        });

        await context.SaveChangesAsync();

        var handler = new GetAuditOverviewQueryHandler(context);
        var response = await handler.Handle(new GetAuditOverviewQuery(project.Id), default);

        response.Success.Should().BeTrue();
        var data = response.Data!;
        data.HealthScore.Should().Be(88.5m);
        data.UrlsCrawled.Should().Be(42);
        data.ErrorsCount.Should().Be(3);
        data.WarningsCount.Should().Be(5);
        data.NoticesCount.Should().Be(2);
        data.IssuesByCategory.Should().ContainKey("Indexability");
    }
}
