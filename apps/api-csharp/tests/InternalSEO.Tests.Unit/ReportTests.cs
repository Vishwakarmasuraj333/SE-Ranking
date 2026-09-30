using System.Text.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Reports.Commands;
using InternalSEO.Application.Features.Reports.DTOs;
using InternalSEO.Application.Features.Reports.Queries;
using InternalSEO.Application.Features.Rankings.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class ReportTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IActivityLogger> _mockActivityLogger;

    public ReportTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"ReportsDb_{Guid.NewGuid():N}")
            .Options;

        _context = new ApplicationDbContext(options);
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockActivityLogger = new Mock<IActivityLogger>();
    }

    [Fact]
    public void CreateReportCommandValidator_WithValidData_PassesValidation()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            Guid.NewGuid(),
            "Q3 SEO Executive Performance Report",
            DateTimeOffset.UtcNow.AddDays(-30),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi", "rankings", "gsc", "audit", "tasks" },
            "Executive commentary here"
        );

        var result = validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateReportCommandValidator_WithEmptyTitle_FailsValidation()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            Guid.NewGuid(),
            "",
            DateTimeOffset.UtcNow.AddDays(-30),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi" },
            null
        );

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void CreateReportCommandValidator_WithStartDateAfterEndDate_FailsValidation()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            Guid.NewGuid(),
            "Invalid Date Range Report",
            DateTimeOffset.UtcNow.AddDays(5),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi" },
            null
        );

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage.Contains("StartDate must be less than or equal to EndDate"));
    }

    [Fact]
    public void CreateReportCommandValidator_WithDateRangeExceeding365Days_FailsValidation()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            Guid.NewGuid(),
            "Yearly Report",
            DateTimeOffset.UtcNow.AddDays(-400),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi" },
            null
        );

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Date range cannot exceed 365 days"));
    }

    [Fact]
    public void CreateReportCommandValidator_WithEmptySections_FailsValidation()
    {
        var validator = new CreateReportCommandValidator();
        var command = new CreateReportCommand(
            Guid.NewGuid(),
            "No Sections Report",
            DateTimeOffset.UtcNow.AddDays(-30),
            DateTimeOffset.UtcNow,
            new List<string>(),
            null
        );

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Sections");
    }

    [Fact]
    public async Task CreateReportCommandHandler_CompilesAllSectionsAccurately()
    {
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mockCurrentUserService.Setup(s => s.UserId).Returns(userId);

        var user = new User
        {
            Id = userId,
            Email = "exec@company.internal",
            FirstName = "SEO",
            LastName = "Executive"
        };
        _context.Users.Add(user);

        var project = new Project
        {
            Id = projectId,
            Name = "Alpha Site",
            PrimaryDomain = "alpha.com",
            Status = ProjectStatus.Active,
            CreatedBy = userId
        };
        _context.Projects.Add(project);

        var crawlRun = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Status = "Completed",
            HealthScore = 88.5m,
            UrlsCrawled = 150,
            ErrorsCount = 3,
            WarningsCount = 7,
            NoticesCount = 12,
            CompletedAt = DateTimeOffset.UtcNow.AddDays(-2)
        };
        _context.CrawlRuns.Add(crawlRun);

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            KeywordText = "best seo platform",
            CreatedBy = userId
        };
        _context.Keywords.Add(keyword);

        var rankResult = new RankResult
        {
            Id = 1,
            KeywordId = keyword.Id,
            ProjectId = projectId,
            CheckDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Position = 3,
            PreviousPosition = 5,
            PositionChange = 2,
            RankedUrl = "https://alpha.com/features"
        };
        _context.RankResults.Add(rankResult);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = "Fix 404 broken links",
            Status = "Verified",
            Priority = "High",
            CreatedBy = userId
        };
        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        var handler = new CreateReportCommandHandler(
            _context,
            _mockCurrentUserService.Object,
            _mockActivityLogger.Object
        );

        var command = new CreateReportCommand(
            projectId,
            "Complete Executive Report",
            DateTimeOffset.UtcNow.AddDays(-30),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi", "rankings", "gsc", "audit", "tasks" },
            "Important progress this month."
        );

        var response = await handler.Handle(command, CancellationToken.None);

        response.Should().NotBeNull();
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Title.Should().Be("Complete Executive Report");
        response.Data.ProjectId.Should().Be(projectId);

        // Deserialize snapshot and inspect frozen values
        var snapshot = JsonSerializer.Deserialize<ReportSnapshotData>(response.Data.SnapshotJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        snapshot.Should().NotBeNull();
        snapshot!.KpiSummary.Should().NotBeNull();
        snapshot.KpiSummary!.HealthScore.Should().Be(88.5m);
        snapshot.KpiSummary.SearchVisibility.Should().Be(18.7m); // Position 3 weight
        snapshot.KpiSummary.CompletedTasksCount.Should().Be(1);

        snapshot.Rankings.Should().NotBeNull();
        snapshot.Rankings!.Top3.Should().Be(1);
        snapshot.Rankings.Improved.Should().Be(1);

        snapshot.TechnicalAudit.Should().NotBeNull();
        snapshot.TechnicalAudit!.HealthScore.Should().Be(88.5m);
        snapshot.TechnicalAudit.TotalCrawledUrls.Should().Be(150);

        snapshot.Tasks.Should().NotBeNull();
        snapshot.Tasks!.CompletedCount.Should().Be(1);
    }

    [Fact]
    public async Task CreateReportCommandHandler_WithEmptyModules_HandlesGracefullyWithoutThrowing()
    {
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mockCurrentUserService.Setup(s => s.UserId).Returns(userId);

        var user = new User { Id = userId, Email = "test@company.internal", FirstName = "Tester", LastName = "One" };
        _context.Users.Add(user);

        var project = new Project
        {
            Id = projectId,
            Name = "Empty Site",
            PrimaryDomain = "empty.com",
            Status = ProjectStatus.Active,
            CreatedBy = userId
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        var handler = new CreateReportCommandHandler(
            _context,
            _mockCurrentUserService.Object,
            _mockActivityLogger.Object
        );

        var command = new CreateReportCommand(
            projectId,
            "Empty Project Report",
            DateTimeOffset.UtcNow.AddDays(-7),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi", "rankings", "gsc", "audit", "tasks" },
            null
        );

        var response = await handler.Handle(command, CancellationToken.None);

        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();

        var snapshot = JsonSerializer.Deserialize<ReportSnapshotData>(response.Data!.SnapshotJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        snapshot.Should().NotBeNull();
        snapshot!.KpiSummary!.HealthScore.Should().BeNull();
        snapshot.KpiSummary.SearchVisibility.Should().BeNull();
        snapshot.KpiSummary.CompletedTasksCount.Should().Be(0);
        snapshot.TechnicalAudit!.HasCrawl.Should().BeFalse();
        snapshot.GoogleSearchConsole!.HasData.Should().BeFalse();
    }

    [Fact]
    public async Task GetProjectReportsQueryHandler_ReturnsReportsForProject()
    {
        var projectId = Guid.NewGuid();
        var otherProjectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var user = new User { Id = userId, Email = "author@company.internal", FirstName = "Author", LastName = "User" };
        _context.Users.Add(user);

        var project = new Project { Id = projectId, Name = "P1", PrimaryDomain = "p1.com", CreatedBy = userId };
        var otherProject = new Project { Id = otherProjectId, Name = "P2", PrimaryDomain = "p2.com", CreatedBy = userId };
        _context.Projects.AddRange(project, otherProject);

        var r1 = new ReportRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = "Report 1",
            StartDate = DateTimeOffset.UtcNow.AddDays(-10),
            EndDate = DateTimeOffset.UtcNow,
            Sections = "kpi",
            SnapshotJson = "{}",
            CreatedByUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-2)
        };
        var r2 = new ReportRun
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = "Report 2",
            StartDate = DateTimeOffset.UtcNow.AddDays(-20),
            EndDate = DateTimeOffset.UtcNow,
            Sections = "kpi,rankings",
            SnapshotJson = "{}",
            CreatedByUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-1)
        };
        var rOther = new ReportRun
        {
            Id = Guid.NewGuid(),
            ProjectId = otherProjectId,
            Title = "Other Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-5),
            EndDate = DateTimeOffset.UtcNow,
            Sections = "kpi",
            SnapshotJson = "{}",
            CreatedByUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.ReportRuns.AddRange(r1, r2, rOther);
        await _context.SaveChangesAsync();

        var handler = new GetProjectReportsQueryHandler(_context);
        var response = await handler.Handle(new GetProjectReportsQuery(projectId), CancellationToken.None);

        response.Success.Should().BeTrue();
        response.Data.Should().HaveCount(2);
        response.Data!.Select(r => r.Title).Should().Contain(new[] { "Report 1", "Report 2" });
        response.Data.Select(r => r.Title).Should().NotContain("Other Report");
    }

    [Fact]
    public async Task GetReportDetailQueryHandler_WithWrongProject_ThrowsNotFoundException()
    {
        var projectIdA = Guid.NewGuid();
        var projectIdB = Guid.NewGuid();
        var reportId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var user = new User { Id = userId, Email = "u@test.com" };
        _context.Users.Add(user);
        var projectA = new Project { Id = projectIdA, Name = "PA", PrimaryDomain = "pa.com", CreatedBy = userId };
        _context.Projects.Add(projectA);

        var report = new ReportRun
        {
            Id = reportId,
            ProjectId = projectIdA,
            Title = "Project A Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = "kpi",
            SnapshotJson = "{}",
            CreatedByUserId = userId
        };
        _context.ReportRuns.Add(report);
        await _context.SaveChangesAsync();

        var handler = new GetReportDetailQueryHandler(_context);

        // Access report of Project A through Project B route
        var act = () => handler.Handle(new GetReportDetailQuery(projectIdB, reportId), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteReportCommandHandler_DeletesReportSuccessfully()
    {
        var projectId = Guid.NewGuid();
        var reportId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var report = new ReportRun
        {
            Id = reportId,
            ProjectId = projectId,
            Title = "To Delete",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = "kpi",
            SnapshotJson = "{}",
            CreatedByUserId = userId
        };
        _context.ReportRuns.Add(report);
        await _context.SaveChangesAsync();

        var handler = new DeleteReportCommandHandler(_context, _mockActivityLogger.Object);
        var response = await handler.Handle(new DeleteReportCommand(projectId, reportId), CancellationToken.None);

        response.Success.Should().BeTrue();
        (await _context.ReportRuns.FindAsync(reportId)).Should().BeNull();
    }

    [Theory]
    [InlineData(1, 31.7)]
    [InlineData(2, 24.7)]
    [InlineData(3, 18.7)]
    [InlineData(4, 13.6)]
    [InlineData(5, 9.5)]
    [InlineData(10, 3.5)]
    [InlineData(11, 1.5)]
    [InlineData(20, 1.5)]
    [InlineData(21, 0.7)]
    [InlineData(30, 0.7)]
    [InlineData(31, 0.1)]
    [InlineData(50, 0.1)]
    [InlineData(51, 0.1)]
    [InlineData(100, 0.1)]
    [InlineData(101, 0.1)]
    [InlineData(null, 0.0)]
    public async Task CreateReportCommandHandler_SearchVisibility_MatchesRankingsOverviewSemantics_AcrossAllPositions(int? testPosition, double expectedVisibility)
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mockCurrentUserService.Setup(s => s.UserId).Returns(userId);
        _mockCurrentUserService.Setup(s => s.Email).Returns("exec@company.internal");

        var project = new Project
        {
            Id = projectId,
            Name = $"Visibility Test Project {testPosition}",
            PrimaryDomain = "visibility.test",
            CreatedBy = userId
        };
        _context.Projects.Add(project);

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            KeywordText = $"keyword at pos {testPosition}",
            CreatedBy = userId
        };
        _context.Keywords.Add(keyword);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var rankResult = new RankResult
        {
            ProjectId = projectId,
            KeywordId = keyword.Id,
            CheckDate = today,
            Position = testPosition,
            PreviousPosition = testPosition.HasValue ? testPosition.Value + 1 : null,
            PositionChange = 1,
            RankedUrl = "https://visibility.test/p"
        };
        _context.RankResults.Add(rankResult);

        await _context.SaveChangesAsync();

        // 1. Compute via canonical Rankings Overview Query
        var rankingsHandler = new GetRankingsOverviewQueryHandler(_context);
        var rankingsResponse = await rankingsHandler.Handle(new GetRankingsOverviewQuery(projectId), CancellationToken.None);
        rankingsResponse.Success.Should().BeTrue();
        var expectedScore = rankingsResponse.Data!.SearchVisibility;

        // 2. Compute via Report Compiler
        var reportHandler = new CreateReportCommandHandler(
            _context,
            _mockCurrentUserService.Object,
            _mockActivityLogger.Object
        );

        var command = new CreateReportCommand(
            projectId,
            $"Report for Pos {testPosition}",
            DateTimeOffset.UtcNow.AddDays(-7),
            DateTimeOffset.UtcNow,
            new List<string> { "kpi", "rankings" },
            "Visibility verification"
        );

        var reportResponse = await reportHandler.Handle(command, CancellationToken.None);
        reportResponse.Success.Should().BeTrue();

        var snapshot = JsonSerializer.Deserialize<ReportSnapshotData>(reportResponse.Data!.SnapshotJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // 3. Assert exact equivalence between Report and Rankings Overview Query
        snapshot.Should().NotBeNull();
        snapshot!.KpiSummary.Should().NotBeNull();
        snapshot.Rankings.Should().NotBeNull();

        // Check value matches canonical formula expected value
        snapshot.KpiSummary!.SearchVisibility.Should().Be((decimal)expectedVisibility);
        snapshot.Rankings!.SearchVisibility.Should().Be((decimal)expectedVisibility);

        // Check value matches exact output of GetRankingsOverviewQuery
        snapshot.KpiSummary.SearchVisibility.Should().Be(expectedScore);
        snapshot.Rankings.SearchVisibility.Should().Be(expectedScore);
    }
}
