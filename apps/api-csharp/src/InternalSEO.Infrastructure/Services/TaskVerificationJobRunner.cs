using InternalSEO.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class TaskVerificationJobRunner : ITaskVerificationRunner
{
    private readonly IApplicationDbContext _context;
    private readonly IWebCrawlerService _crawlerService;
    private readonly IIssueVerificationEvaluator _evaluator;
    private readonly IActivityLogger _activityLogger;
    private readonly ILogger<TaskVerificationJobRunner> _logger;

    public TaskVerificationJobRunner(
        IApplicationDbContext context,
        IWebCrawlerService crawlerService,
        IIssueVerificationEvaluator evaluator,
        IActivityLogger activityLogger,
        ILogger<TaskVerificationJobRunner> logger)
    {
        _context = context;
        _crawlerService = crawlerService;
        _evaluator = evaluator;
        _activityLogger = activityLogger;
        _logger = logger;
    }

    public async Task ExecuteVerificationAsync(long taskVerificationId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Beginning task verification execution for Verification ID: {Id}", taskVerificationId);

        var verification = await _context.TaskVerifications
            .Include(v => v.Task)
                .ThenInclude(t => t.Project)
            .Include(v => v.Task)
                .ThenInclude(t => t.SourceIssue)
            .FirstOrDefaultAsync(v => v.Id == taskVerificationId, cancellationToken);

        if (verification == null)
        {
            _logger.LogWarning("TaskVerification with ID {Id} was not found.", taskVerificationId);
            return;
        }

        var task = verification.Task;
        var project = task.Project;
        var sourceIssue = task.SourceIssue;

        await _activityLogger.LogAsync(
            actionType: "Task.VerificationStarted",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: project.Id,
            payload: new { TaskVerificationId = verification.Id, TaskId = task.Id },
            cancellationToken: cancellationToken);

        var targetUrl = task.AffectedUrl;
        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            verification.Status = "Error";
            verification.Details = "Task does not specify an affected URL to verify.";
            verification.CompletedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return;
        }

        if (!Uri.TryCreate(targetUrl, UriKind.Absolute, out var targetUri))
        {
            verification.Status = "Error";
            verification.Details = $"Affected URL '{targetUrl}' is not a valid absolute URI.";
            verification.CompletedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return;
        }

        var ruleCode = sourceIssue?.RuleCode ?? "RULE-HTTP-404";

        try
        {
            // Perform single-URL bounded recheck using existing WebCrawlerService
            var crawlResults = await _crawlerService.CrawlWebsiteAsync(
                startUrl: targetUri,
                primaryDomain: project.PrimaryDomain,
                maxPages: 1,
                maxDepth: 0,
                rateLimitMs: 0,
                userAgent: "InternalSEOPlatformBot/1.0",
                onProgressAsync: null,
                cancellationToken: cancellationToken);

            var pageResult = crawlResults.FirstOrDefault();
            if (pageResult == null)
            {
                verification.Status = "Failed";
                verification.Details = "Verification failed: Target URL could not be crawled or returned no data.";
                verification.CompletedAt = DateTimeOffset.UtcNow;
                task.Status = "Reopened";
                task.UpdatedAt = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);
                await _activityLogger.LogAsync(
                    actionType: "Task.VerificationFailed",
                    entityType: "Task",
                    entityId: task.Id.ToString(),
                    projectId: project.Id,
                    payload: new { TaskVerificationId = verification.Id, Reason = verification.Details },
                    cancellationToken: cancellationToken);
                return;
            }

            var evalResult = _evaluator.EvaluateRemediation(ruleCode, targetUrl, pageResult, sourceIssue);

            verification.CompletedAt = DateTimeOffset.UtcNow;
            verification.Details = evalResult.Details;

            if (evalResult.IsPassed)
            {
                verification.Status = "Passed";
                task.Status = "Verified";
                task.UpdatedAt = DateTimeOffset.UtcNow;

                if (sourceIssue != null)
                {
                    sourceIssue.Status = "Resolved";
                    sourceIssue.LastSeenAt = DateTimeOffset.UtcNow;
                }

                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.LogAsync(
                    actionType: "Task.VerificationPassed",
                    entityType: "Task",
                    entityId: task.Id.ToString(),
                    projectId: project.Id,
                    payload: new { TaskVerificationId = verification.Id, RuleCode = ruleCode, Details = evalResult.Details },
                    cancellationToken: cancellationToken);

                await _activityLogger.LogAsync(
                    actionType: "Task.Verified",
                    entityType: "Task",
                    entityId: task.Id.ToString(),
                    projectId: project.Id,
                    payload: new { TaskId = task.Id },
                    cancellationToken: cancellationToken);

                _logger.LogInformation("Task {TaskId} successfully verified for rule {RuleCode}", task.Id, ruleCode);
            }
            else
            {
                verification.Status = "Failed";
                task.Status = "Reopened";
                task.UpdatedAt = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                await _activityLogger.LogAsync(
                    actionType: "Task.VerificationFailed",
                    entityType: "Task",
                    entityId: task.Id.ToString(),
                    projectId: project.Id,
                    payload: new { TaskVerificationId = verification.Id, RuleCode = ruleCode, Reason = evalResult.Details },
                    cancellationToken: cancellationToken);

                await _activityLogger.LogAsync(
                    actionType: "Task.Reopened",
                    entityType: "Task",
                    entityId: task.Id.ToString(),
                    projectId: project.Id,
                    payload: new { TaskId = task.Id },
                    cancellationToken: cancellationToken);

                _logger.LogInformation("Task {TaskId} verification failed for rule {RuleCode}: {Reason}", task.Id, ruleCode, evalResult.Details);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during task verification execution for ID {Id}", taskVerificationId);
            verification.Status = "Error";
            verification.Details = $"Verification execution error: {ex.Message}";
            verification.CompletedAt = DateTimeOffset.UtcNow;
            task.Status = "Reopened";
            task.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            await _activityLogger.LogAsync(
                actionType: "Task.VerificationFailed",
                entityType: "Task",
                entityId: task.Id.ToString(),
                projectId: project.Id,
                payload: new { TaskVerificationId = verification.Id, Error = ex.Message },
                cancellationToken: cancellationToken);
        }
    }
}
