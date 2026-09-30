using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class CrawlJobRunner : ICrawlJobRunner
{
    private readonly IApplicationDbContext _context;
    private readonly IWebCrawlerService _webCrawlerService;
    private readonly IAuditRuleEvaluator _auditRuleEvaluator;
    private readonly IActivityLogger _activityLogger;
    private readonly INotificationService _notificationService;
    private readonly ILogger<CrawlJobRunner> _logger;

    public CrawlJobRunner(
        IApplicationDbContext context,
        IWebCrawlerService webCrawlerService,
        IAuditRuleEvaluator auditRuleEvaluator,
        IActivityLogger activityLogger,
        INotificationService notificationService,
        ILogger<CrawlJobRunner> logger)
    {
        _context = context;
        _webCrawlerService = webCrawlerService;
        _auditRuleEvaluator = auditRuleEvaluator;
        _activityLogger = activityLogger;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task ExecuteCrawlAsync(Guid crawlRunId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Beginning crawl execution for CrawlRun: {CrawlRunId}", crawlRunId);

        var crawlRun = await _context.CrawlRuns
            .Include(r => r.Project)
            .ThenInclude(p => p.Settings)
            .FirstOrDefaultAsync(r => r.Id == crawlRunId, cancellationToken);

        if (crawlRun == null)
        {
            _logger.LogError("CrawlRun {CrawlRunId} was not found in database.", crawlRunId);
            return;
        }

        if (crawlRun.Status != "Queued")
        {
            _logger.LogWarning("CrawlRun {CrawlRunId} is in status '{Status}', expected 'Queued'. Skipping.", crawlRunId, crawlRun.Status);
            return;
        }

        var project = crawlRun.Project;
        var settings = project.Settings;

        crawlRun.Status = "Crawling";
        crawlRun.StartedAt = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            var rawDomain = project.PrimaryDomain.Trim().TrimEnd('/');
            var protocol = string.IsNullOrWhiteSpace(project.Protocol) ? "https://" : project.Protocol;
            if (!protocol.EndsWith("://")) protocol += "://";
            var startUrl = new Uri($"{protocol}{rawDomain}");

            int maxPages = settings?.CrawlMaxPages ?? 50;
            int maxDepth = settings?.CrawlMaxDepth ?? 5;
            int rateLimitMs = settings?.CrawlRateLimitMs ?? 100;
            string userAgent = settings?.CrawlUserAgent ?? "InternalSEOPlatformBot/1.0";

            DateTimeOffset lastProgressUpdate = DateTimeOffset.UtcNow;
            var pageResults = await _webCrawlerService.CrawlWebsiteAsync(
                startUrl,
                project.PrimaryDomain,
                maxPages,
                maxDepth,
                rateLimitMs,
                userAgent,
                async (crawled, discovered) =>
                {
                    crawlRun.UrlsCrawled = crawled;
                    crawlRun.UrlsDiscovered = discovered;
                    if ((DateTimeOffset.UtcNow - lastProgressUpdate).TotalSeconds >= 2)
                    {
                        lastProgressUpdate = DateTimeOffset.UtcNow;
                        await _context.SaveChangesAsync(CancellationToken.None);
                    }
                },
                cancellationToken);

            if (pageResults.Count == 0)
            {
                throw new CrawlValidationException($"No pages could be crawled from start URL '{startUrl}'.");
            }

            crawlRun.Status = "Evaluating";
            crawlRun.UrlsCrawled = pageResults.Count;
            await _context.SaveChangesAsync(cancellationToken);

            // Persist crawled pages
            var pages = pageResults.Select(p => new CrawlPage
            {
                CrawlRunId = crawlRun.Id,
                ProjectId = project.Id,
                Url = p.Url,
                UrlHash = p.UrlHash,
                HttpStatusCode = p.HttpStatusCode,
                ContentType = p.ContentType,
                ContentLengthBytes = p.ContentLengthBytes,
                LoadTimeMs = p.LoadTimeMs,
                CrawlDepth = p.CrawlDepth,
                Title = p.Title,
                TitleLength = p.TitleLength,
                MetaDescription = p.MetaDescription,
                H1 = p.H1,
                H1Count = p.H1Count,
                CanonicalUrl = p.CanonicalUrl,
                IsIndexable = p.IsIndexable,
                IndexabilityStatus = p.IndexabilityStatus,
                InlinksCount = p.InlinksCount,
                OutlinksCount = p.OutlinksCount,
                CrawledAt = DateTimeOffset.UtcNow
            }).ToList();

            _context.CrawlPages.AddRange(pages);
            await _context.SaveChangesAsync(cancellationToken);

            // Evaluate audit rules
            var evaluation = _auditRuleEvaluator.Evaluate(crawlRun.Id, project.Id, pageResults);

            _context.AuditIssues.AddRange(evaluation.Issues);

            // Update crawl run status and metrics
            crawlRun.Status = "Completed";
            crawlRun.CompletedAt = DateTimeOffset.UtcNow;
            crawlRun.UrlsCrawled = pageResults.Count;
            crawlRun.UrlsDiscovered = Math.Max(crawlRun.UrlsDiscovered, pageResults.Count);
            crawlRun.ErrorsCount = evaluation.ErrorsCount;
            crawlRun.WarningsCount = evaluation.WarningsCount;
            crawlRun.NoticesCount = evaluation.NoticesCount;
            crawlRun.HealthScore = evaluation.HealthScore;

            // HealthScoreDrop check: Query immediately preceding completed crawl for this project
            var previousCrawl = await _context.CrawlRuns
                .AsNoTracking()
                .Where(r => r.ProjectId == project.Id &&
                            r.Id != crawlRun.Id &&
                            r.Status == "Completed" &&
                            r.HealthScore.HasValue)
                .OrderByDescending(r => r.CompletedAt ?? r.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            await _activityLogger.LogAsync(
                actionType: "Crawl.Completed",
                entityType: "CrawlRun",
                entityId: crawlRun.Id.ToString(),
                projectId: project.Id,
                payload: new { crawlRun.UrlsCrawled, crawlRun.ErrorsCount, crawlRun.HealthScore },
                cancellationToken: cancellationToken);

            _logger.LogInformation("CrawlRun {CrawlRunId} completed successfully with health score {HealthScore}.", crawlRunId, crawlRun.HealthScore);

            // Trigger HealthScoreDrop if relative degradation > 10%
            if (previousCrawl?.HealthScore.HasValue == true && previousCrawl.HealthScore.Value > 0)
            {
                var prevScore = previousCrawl.HealthScore.Value;
                var currScore = evaluation.HealthScore;
                var relativeDrop = (prevScore - currScore) / prevScore;

                if (relativeDrop > 0.10m)
                {
                    var dropPct = Math.Round(relativeDrop * 100m, 1);
                    var auditTargetUrl = $"/projects/{project.Id}/audit?runId={crawlRun.Id}";

                    await _notificationService.CreateProjectBroadcastAsync(
                        projectId: project.Id,
                        title: "Health Score Drop Detected",
                        message: $"SEO health score dropped by {dropPct}% (from {prevScore:F1} to {currScore:F1}) following latest crawl.",
                        severity: "Warning",
                        eventType: "HealthScoreDrop",
                        targetUrl: auditTargetUrl,
                        cancellationToken: cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CrawlRun {CrawlRunId} execution failed: {Message}", crawlRunId, ex.Message);
            crawlRun.Status = "Failed";
            crawlRun.FailureReason = ex.Message;
            crawlRun.CompletedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(CancellationToken.None);

            await _activityLogger.LogAsync(
                actionType: "Crawl.Failed",
                entityType: "CrawlRun",
                entityId: crawlRun.Id.ToString(),
                projectId: project.Id,
                payload: new { Error = ex.Message },
                cancellationToken: CancellationToken.None);

            // Trigger CrawlFailed notification
            try
            {
                var auditTargetUrl = $"/projects/{project.Id}/audit?runId={crawlRun.Id}";
                await _notificationService.CreateProjectBroadcastAsync(
                    projectId: project.Id,
                    title: "Technical Crawl Failed",
                    message: $"Crawl execution failed for {project.PrimaryDomain}: {ex.Message}",
                    severity: "Critical",
                    eventType: "CrawlFailed",
                    targetUrl: auditTargetUrl,
                    cancellationToken: CancellationToken.None);
            }
            catch (Exception notifEx)
            {
                _logger.LogError(notifEx, "Failed to broadcast CrawlFailed notification for CrawlRun {CrawlRunId}", crawlRunId);
            }
        }
    }
}
