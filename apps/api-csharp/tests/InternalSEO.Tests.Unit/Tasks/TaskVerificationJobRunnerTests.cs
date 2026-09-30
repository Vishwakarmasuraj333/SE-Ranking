using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Tasks;

public class TaskVerificationJobRunnerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IWebCrawlerService> _crawlerMock = new();
    private readonly Mock<IIssueVerificationEvaluator> _evaluatorMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();
    private readonly Mock<ILogger<TaskVerificationJobRunner>> _loggerMock = new();

    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    public TaskVerificationJobRunnerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        var project = new Project
        {
            Id = _projectId,
            Name = "Runner Test Project",
            PrimaryDomain = "example.com",
            CreatedBy = _userId
        };
        _context.Projects.Add(project);
        _context.SaveChanges();
    }

    [Fact]
    public async System.Threading.Tasks.Task ExecuteVerification_WhenPassed_SetsTaskVerifiedAndIssueResolved()
    {
        var issue = new AuditIssue
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            RuleCode = "RULE-TITLE-MISSING",
            AffectedUrl = "https://example.com/about",
            Status = "Open",
            Severity = "High",
            FirstSeenAt = DateTimeOffset.UtcNow,
            LastSeenAt = DateTimeOffset.UtcNow
        };
        _context.AuditIssues.Add(issue);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            SourceIssueId = issue.Id,
            Title = "Fix missing title on about",
            AffectedUrl = "https://example.com/about",
            Status = "ReadyForVerification",
            Priority = "High"
        };
        _context.Tasks.Add(task);

        var verification = new TaskVerification
        {
            TaskId = task.Id,
            Status = "Queued",
            AttemptedAt = DateTimeOffset.UtcNow
        };
        _context.TaskVerifications.Add(verification);
        await _context.SaveChangesAsync();

        var crawlResult = new CrawlPageResult
        {
            Url = "https://example.com/about",
            HttpStatusCode = 200,
            Title = "About Us"
        };

        _crawlerMock.Setup(c => c.CrawlWebsiteAsync(
            It.IsAny<Uri>(),
            It.IsAny<string>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string>(),
            null,
            It.IsAny<CancellationToken>()
        )).ReturnsAsync(new List<CrawlPageResult> { crawlResult });

        _evaluatorMock.Setup(e => e.EvaluateRemediation("RULE-TITLE-MISSING", "https://example.com/about", crawlResult, It.IsAny<AuditIssue>()))
            .Returns(new IssueVerificationResult(true, true, "Title found"));

        var runner = new TaskVerificationJobRunner(
            _context,
            _crawlerMock.Object,
            _evaluatorMock.Object,
            _activityLoggerMock.Object,
            _loggerMock.Object);

        await runner.ExecuteVerificationAsync(verification.Id, CancellationToken.None);

        var updatedVerification = await _context.TaskVerifications.FindAsync(verification.Id);
        updatedVerification.Should().NotBeNull();
        updatedVerification!.Status.Should().Be("Passed");
        updatedVerification.Details.Should().Be("Title found");

        var updatedTask = await _context.Tasks.FindAsync(task.Id);
        updatedTask.Should().NotBeNull();
        updatedTask!.Status.Should().Be("Verified");

        var updatedIssue = await _context.AuditIssues.FindAsync(issue.Id);
        updatedIssue.Should().NotBeNull();
        updatedIssue!.Status.Should().Be("Resolved");
    }

    [Fact]
    public async System.Threading.Tasks.Task ExecuteVerification_WhenFailed_SetsTaskReopenedAndIssueRemainsOpen()
    {
        var issue = new AuditIssue
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            RuleCode = "RULE-TITLE-MISSING",
            AffectedUrl = "https://example.com/about",
            Status = "Open",
            Severity = "High",
            FirstSeenAt = DateTimeOffset.UtcNow,
            LastSeenAt = DateTimeOffset.UtcNow
        };
        _context.AuditIssues.Add(issue);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            SourceIssueId = issue.Id,
            Title = "Fix missing title on about",
            AffectedUrl = "https://example.com/about",
            Status = "ReadyForVerification",
            Priority = "High"
        };
        _context.Tasks.Add(task);

        var verification = new TaskVerification
        {
            TaskId = task.Id,
            Status = "Queued",
            AttemptedAt = DateTimeOffset.UtcNow
        };
        _context.TaskVerifications.Add(verification);
        await _context.SaveChangesAsync();

        var crawlResult = new CrawlPageResult
        {
            Url = "https://example.com/about",
            HttpStatusCode = 200,
            Title = ""
        };

        _crawlerMock.Setup(c => c.CrawlWebsiteAsync(
            It.IsAny<Uri>(),
            It.IsAny<string>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string>(),
            null,
            It.IsAny<CancellationToken>()
        )).ReturnsAsync(new List<CrawlPageResult> { crawlResult });

        _evaluatorMock.Setup(e => e.EvaluateRemediation("RULE-TITLE-MISSING", "https://example.com/about", crawlResult, It.IsAny<AuditIssue>()))
            .Returns(new IssueVerificationResult(false, true, "Title tag is still missing"));

        var runner = new TaskVerificationJobRunner(
            _context,
            _crawlerMock.Object,
            _evaluatorMock.Object,
            _activityLoggerMock.Object,
            _loggerMock.Object);

        await runner.ExecuteVerificationAsync(verification.Id, CancellationToken.None);

        var updatedVerification = await _context.TaskVerifications.FindAsync(verification.Id);
        updatedVerification!.Status.Should().Be("Failed");
        updatedVerification.Details.Should().Be("Title tag is still missing");

        var updatedTask = await _context.Tasks.FindAsync(task.Id);
        updatedTask!.Status.Should().Be("Reopened");

        var updatedIssue = await _context.AuditIssues.FindAsync(issue.Id);
        updatedIssue!.Status.Should().Be("Open");
    }

    [Fact]
    public async System.Threading.Tasks.Task ExecuteVerification_WhenCrawlerThrows_SetsStatusErrorAndReopened()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Fix error page",
            AffectedUrl = "https://example.com/error",
            Status = "ReadyForVerification",
            Priority = "Medium"
        };
        _context.Tasks.Add(task);

        var verification = new TaskVerification
        {
            TaskId = task.Id,
            Status = "Queued",
            AttemptedAt = DateTimeOffset.UtcNow
        };
        _context.TaskVerifications.Add(verification);
        await _context.SaveChangesAsync();

        _crawlerMock.Setup(c => c.CrawlWebsiteAsync(
            It.IsAny<Uri>(),
            It.IsAny<string>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string>(),
            null,
            It.IsAny<CancellationToken>()
        )).ThrowsAsync(new HttpRequestException("Connection refused"));

        var runner = new TaskVerificationJobRunner(
            _context,
            _crawlerMock.Object,
            _evaluatorMock.Object,
            _activityLoggerMock.Object,
            _loggerMock.Object);

        await runner.ExecuteVerificationAsync(verification.Id, CancellationToken.None);

        var updatedVerification = await _context.TaskVerifications.FindAsync(verification.Id);
        updatedVerification!.Status.Should().Be("Error");
        updatedVerification.Details.Should().Contain("Connection refused");

        var updatedTask = await _context.Tasks.FindAsync(task.Id);
        updatedTask!.Status.Should().Be("Reopened");
    }
}
