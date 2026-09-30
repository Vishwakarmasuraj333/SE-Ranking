using System.Text.Json;
using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Reports.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Reports.Commands;

public record CreateReportCommand(
    Guid ProjectId,
    string Title,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    List<string> Sections,
    string? ExecutiveNotes
) : IRequest<ApiResponse<ReportDetailDto>>;

public class CreateReportCommandValidator : AbstractValidator<CreateReportCommand>
{
    public CreateReportCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Report title is required.")
            .MaximumLength(200).WithMessage("Report title must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .Must((cmd, start) => start <= cmd.EndDate)
            .WithMessage("StartDate must be less than or equal to EndDate.");

        RuleFor(x => x.StartDate)
            .Must((cmd, start) => (cmd.EndDate - start).TotalDays <= 365)
            .WithMessage("Date range cannot exceed 365 days.");

        RuleFor(x => x.Sections)
            .NotEmpty().WithMessage("At least one section must be selected.");

        RuleFor(x => x.ExecutiveNotes)
            .MaximumLength(4000).WithMessage("Executive notes must not exceed 4,000 characters.");
    }
}

public class CreateReportCommandHandler : IRequestHandler<CreateReportCommand, ApiResponse<ReportDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public CreateReportCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<ReportDetailDto>> Handle(CreateReportCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        var currentUserId = _currentUserService.UserId ?? Guid.Empty;
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
        var authorName = user?.FullName ?? user?.Email ?? "System User";

        var activeSections = request.Sections
            .Select(s => s.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();

        var reportId = Guid.NewGuid();
        var generatedAt = DateTimeOffset.UtcNow;
        var startDateOnly = DateOnly.FromDateTime(request.StartDate.UtcDateTime);
        var endDateOnly = DateOnly.FromDateTime(request.EndDate.UtcDateTime);

        var snapshotData = new ReportSnapshotData
        {
            ReportId = reportId,
            ProjectId = project.Id,
            ProjectName = project.Name,
            ProjectDomain = project.PrimaryDomain,
            Title = request.Title.Trim(),
            ExecutiveNotes = request.ExecutiveNotes?.Trim(),
            GeneratedAtUtc = generatedAt,
            CreatedByUserName = authorName,
            StartDateUtc = request.StartDate,
            EndDateUtc = request.EndDate,
            SectionsIncluded = activeSections
        };

        // 1. Technical Audit compilation
        ReportAuditSection? auditSection = null;
        decimal? auditHealthScore = null;
        if (activeSections.Contains("audit") || activeSections.Contains("kpi"))
        {
            var latestCrawl = await _context.CrawlRuns
                .AsNoTracking()
                .Where(c => c.ProjectId == request.ProjectId && c.Status == "Completed" && c.CompletedAt <= request.EndDate)
                .OrderByDescending(c => c.CompletedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (latestCrawl == null)
            {
                latestCrawl = await _context.CrawlRuns
                    .AsNoTracking()
                    .Where(c => c.ProjectId == request.ProjectId && c.Status == "Completed")
                    .OrderByDescending(c => c.CompletedAt)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            if (latestCrawl != null)
            {
                auditHealthScore = latestCrawl.HealthScore;
                var topIssues = await _context.AuditIssues
                    .AsNoTracking()
                    .Include(i => i.Rule)
                    .Where(i => i.CrawlRunId == latestCrawl.Id && i.Status != "Ignored")
                    .OrderByDescending(i => i.Severity == "Critical" ? 4 : i.Severity == "Error" ? 3 : i.Severity == "Warning" ? 2 : 1)
                    .Take(10)
                    .Select(i => new ReportAuditIssueItem
                    {
                        IssueId = i.Id,
                        RuleCode = i.RuleCode,
                        RuleName = i.Rule.Title,
                        Severity = i.Severity,
                        Category = i.Rule.Category,
                        AffectedUrlsCount = 1
                    })
                    .ToListAsync(cancellationToken);

                auditSection = new ReportAuditSection
                {
                    HealthScore = latestCrawl.HealthScore,
                    TotalCrawledUrls = latestCrawl.UrlsCrawled,
                    TotalErrors = latestCrawl.ErrorsCount,
                    TotalWarnings = latestCrawl.WarningsCount,
                    TotalNotices = latestCrawl.NoticesCount,
                    HasCrawl = true,
                    CrawlCompletedAt = latestCrawl.CompletedAt,
                    TopIssues = topIssues
                };
            }
            else
            {
                auditSection = new ReportAuditSection
                {
                    HealthScore = null,
                    TotalCrawledUrls = 0,
                    TotalErrors = 0,
                    TotalWarnings = 0,
                    TotalNotices = 0,
                    HasCrawl = false,
                    CrawlCompletedAt = null,
                    TopIssues = new()
                };
            }
        }

        // 2. Rankings compilation (Canonical CTR-Weighted Visibility Model matching GetRankingsOverviewQuery)
        ReportRankingsSection? rankingsSection = null;
        decimal? rankingsVisibility = null;
        if (activeSections.Contains("rankings") || activeSections.Contains("kpi"))
        {
            var keywords = await _context.Keywords
                .AsNoTracking()
                .Where(k => k.ProjectId == request.ProjectId)
                .ToListAsync(cancellationToken);

            var totalKeywordsCount = keywords.Count;

            var rankResults = await _context.RankResults
                .AsNoTracking()
                .Include(r => r.Keyword)
                .Where(r => r.ProjectId == request.ProjectId && r.CheckDate <= endDateOnly)
                .OrderByDescending(r => r.CheckDate)
                .ToListAsync(cancellationToken);

            var latestByKeyword = rankResults
                .GroupBy(r => r.KeywordId)
                .Select(g => g.First())
                .ToList();

            var rankingKeywords = latestByKeyword
                .Where(r => r.Position.HasValue && r.Position.Value > 0)
                .ToList();

            if (totalKeywordsCount > 0)
            {
                decimal totalCtr = 0m;
                foreach (var r in rankingKeywords)
                {
                    var pos = r.Position!.Value;
                    totalCtr += pos switch
                    {
                        1 => 31.7m,
                        2 => 24.7m,
                        3 => 18.7m,
                        4 => 13.6m,
                        5 => 9.5m,
                        <= 10 => 3.5m,
                        <= 20 => 1.5m,
                        <= 30 => 0.7m,
                        _ => 0.1m
                    };
                }
                rankingsVisibility = Math.Round(totalCtr / totalKeywordsCount, 1);
            }
            else
            {
                rankingsVisibility = null;
            }

            var top3 = rankingKeywords.Count(r => r.Position!.Value <= 3);
            var top10 = rankingKeywords.Count(r => r.Position!.Value <= 10);
            var top20 = rankingKeywords.Count(r => r.Position!.Value <= 20);
            var top100 = rankingKeywords.Count(r => r.Position!.Value <= 100);
            var improved = rankingKeywords.Count(r => (r.PositionChange ?? 0) > 0);
            var declined = rankingKeywords.Count(r => (r.PositionChange ?? 0) < 0);
            var unranked = totalKeywordsCount - top100;
            if (unranked < 0) unranked = 0;

            var topKeywordsList = latestByKeyword
                .OrderBy(r => r.Position.HasValue && r.Position.Value > 0 ? r.Position.Value : 9999)
                .Take(15)
                .Select(r => new ReportRankKeywordItem
                {
                    KeywordId = r.KeywordId,
                    Term = r.Keyword?.KeywordText ?? "Unknown Keyword",
                    CurrentPosition = r.Position,
                    PreviousPosition = r.PreviousPosition,
                    Movement = r.PositionChange ?? 0,
                    BestUrl = r.RankedUrl
                })
                .ToList();

            rankingsSection = new ReportRankingsSection
            {
                SearchVisibility = rankingsVisibility,
                TotalKeywords = totalKeywordsCount,
                Top3 = top3,
                Top10 = top10,
                Top20 = top20,
                Top100 = top100,
                Improved = improved,
                Declined = declined,
                Unranked = unranked,
                TopKeywords = topKeywordsList
            };
        }

        // 3. Google Search Console compilation
        ReportGscSection? gscSection = null;
        long? gscTotalClicks = null;
        long? gscTotalImpressions = null;
        if (activeSections.Contains("gsc") || activeSections.Contains("kpi"))
        {
            var dailyRows = await _context.GscDailyMetrics
                .AsNoTracking()
                .Where(d => d.ProjectId == request.ProjectId && d.MetricDate >= startDateOnly && d.MetricDate <= endDateOnly && d.Device == "ALL")
                .OrderBy(d => d.MetricDate)
                .ToListAsync(cancellationToken);

            if (dailyRows.Count > 0)
            {
                var sumClicks = dailyRows.Sum(d => d.Clicks);
                var sumImpressions = dailyRows.Sum(d => d.Impressions);
                var avgCtr = sumImpressions > 0 ? Math.Round((decimal)sumClicks / sumImpressions, 4) : 0m;
                var avgPos = dailyRows.Count > 0 ? Math.Round(dailyRows.Average(d => d.AveragePosition), 2) : 0m;

                gscTotalClicks = sumClicks;
                gscTotalImpressions = sumImpressions;

                var trends = dailyRows.Select(d => new ReportGscTrendPoint
                {
                    Date = d.MetricDate,
                    Clicks = d.Clicks,
                    Impressions = d.Impressions,
                    Ctr = d.Ctr,
                    Position = d.AveragePosition
                }).ToList();

                var topQueries = await _context.GscQueryMetrics
                    .AsNoTracking()
                    .Where(q => q.ProjectId == request.ProjectId && q.MetricDate >= startDateOnly && q.MetricDate <= endDateOnly && q.Device == "ALL")
                    .GroupBy(q => q.QueryText)
                    .Select(g => new ReportGscQueryItem
                    {
                        Query = g.Key,
                        Clicks = g.Sum(x => x.Clicks),
                        Impressions = g.Sum(x => x.Impressions),
                        Ctr = g.Sum(x => x.Impressions) > 0 ? Math.Round((decimal)g.Sum(x => x.Clicks) / g.Sum(x => x.Impressions), 4) : 0m,
                        Position = g.Any() ? Math.Round(g.Average(x => x.Position), 2) : 0m
                    })
                    .OrderByDescending(q => q.Clicks)
                    .Take(10)
                    .ToListAsync(cancellationToken);

                var topPages = await _context.GscQueryMetrics
                    .AsNoTracking()
                    .Where(q => q.ProjectId == request.ProjectId && q.MetricDate >= startDateOnly && q.MetricDate <= endDateOnly && q.Device == "ALL")
                    .GroupBy(q => q.PageUrl)
                    .Select(g => new ReportGscPageItem
                    {
                        PageUrl = g.Key,
                        Clicks = g.Sum(x => x.Clicks),
                        Impressions = g.Sum(x => x.Impressions),
                        Ctr = g.Sum(x => x.Impressions) > 0 ? Math.Round((decimal)g.Sum(x => x.Clicks) / g.Sum(x => x.Impressions), 4) : 0m,
                        Position = g.Any() ? Math.Round(g.Average(x => x.Position), 2) : 0m
                    })
                    .OrderByDescending(p => p.Clicks)
                    .Take(10)
                    .ToListAsync(cancellationToken);

                gscSection = new ReportGscSection
                {
                    TotalClicks = sumClicks,
                    TotalImpressions = sumImpressions,
                    AverageCtr = avgCtr,
                    AveragePosition = avgPos,
                    HasData = true,
                    DailyTrends = trends,
                    TopQueries = topQueries,
                    TopPages = topPages
                };
            }
            else
            {
                gscSection = new ReportGscSection
                {
                    TotalClicks = 0,
                    TotalImpressions = 0,
                    AverageCtr = 0m,
                    AveragePosition = 0m,
                    HasData = false,
                    DailyTrends = new(),
                    TopQueries = new(),
                    TopPages = new()
                };
            }
        }

        // 4. Tasks compilation
        ReportTasksSection? tasksSection = null;
        int completedTasksCount = 0;
        if (activeSections.Contains("tasks") || activeSections.Contains("kpi"))
        {
            var allTasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.ProjectId == request.ProjectId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync(cancellationToken);

            var todayDateOnly = DateOnly.FromDateTime(DateTime.UtcNow);
            completedTasksCount = allTasks.Count(t => t.Status == "Verified" || t.Status == "Closed");
            var openCount = allTasks.Count(t => t.Status != "Verified" && t.Status != "Closed");
            var overdueCount = allTasks.Count(t => t.Status != "Verified" && t.Status != "Closed" && t.DueDate.HasValue && t.DueDate.Value < todayDateOnly);

            var taskItems = allTasks.Take(15).Select(t => new ReportTaskItem
            {
                TaskId = t.Id,
                Title = t.Title,
                Priority = t.Priority,
                Status = t.Status,
                DueDate = t.DueDate,
                IsOverdue = t.Status != "Verified" && t.Status != "Closed" && t.DueDate.HasValue && t.DueDate.Value < todayDateOnly
            }).ToList();

            tasksSection = new ReportTasksSection
            {
                CompletedCount = completedTasksCount,
                OpenCount = openCount,
                OverdueCount = overdueCount,
                TasksSummary = taskItems
            };
        }

        // 5. Headline KPI Summary
        if (activeSections.Contains("kpi"))
        {
            snapshotData.KpiSummary = new ReportKpiSummary
            {
                HealthScore = auditHealthScore,
                SearchVisibility = rankingsVisibility,
                GscTotalClicks = gscTotalClicks,
                GscTotalImpressions = gscTotalImpressions,
                CompletedTasksCount = completedTasksCount
            };
        }

        if (activeSections.Contains("rankings")) snapshotData.Rankings = rankingsSection;
        if (activeSections.Contains("gsc")) snapshotData.GoogleSearchConsole = gscSection;
        if (activeSections.Contains("audit")) snapshotData.TechnicalAudit = auditSection;
        if (activeSections.Contains("tasks")) snapshotData.Tasks = tasksSection;

        var snapshotJson = JsonSerializer.Serialize(snapshotData, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        var reportRun = new ReportRun
        {
            Id = reportId,
            ProjectId = project.Id,
            Title = request.Title.Trim(),
            ExecutiveSummary = request.ExecutiveNotes?.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Sections = string.Join(",", activeSections),
            SnapshotJson = snapshotJson,
            CreatedByUserId = currentUserId,
            CreatedAt = generatedAt
        };

        _context.ReportRuns.Add(reportRun);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            "Created",
            "ReportRun",
            reportRun.Id.ToString(),
            request.ProjectId,
            $"Created executive report '{reportRun.Title}' for range {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}",
            cancellationToken);

        var resultDto = new ReportDetailDto
        {
            Id = reportRun.Id,
            ProjectId = reportRun.ProjectId,
            Title = reportRun.Title,
            ExecutiveSummary = reportRun.ExecutiveSummary,
            StartDate = reportRun.StartDate,
            EndDate = reportRun.EndDate,
            Sections = reportRun.Sections,
            SnapshotJson = reportRun.SnapshotJson,
            CreatedByUserId = reportRun.CreatedByUserId,
            CreatedByUserName = authorName,
            CreatedAt = reportRun.CreatedAt
        };

        return ApiResponse<ReportDetailDto>.Succeeded(resultDto);
    }
}
