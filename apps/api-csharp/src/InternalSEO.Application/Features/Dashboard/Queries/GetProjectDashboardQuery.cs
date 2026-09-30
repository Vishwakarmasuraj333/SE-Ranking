using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Dashboard.DTOs;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Dashboard.Queries;

public record GetProjectDashboardQuery(Guid ProjectId) : IRequest<ApiResponse<ProjectDashboardDto>>;

public class GetProjectDashboardQueryHandler : IRequestHandler<GetProjectDashboardQuery, ApiResponse<ProjectDashboardDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProjectDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<ProjectDashboardDto>> Handle(GetProjectDashboardQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // 1. Technical Health Summary
        var latestCrawl = await _context.CrawlRuns
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.Status == "Completed")
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latestCrawl == null)
        {
            latestCrawl = await _context.CrawlRuns
                .AsNoTracking()
                .Where(r => r.ProjectId == request.ProjectId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }

        var healthDto = new DashboardHealthDto(
            HealthScore: latestCrawl?.HealthScore,
            TotalUrlsCrawled: latestCrawl?.UrlsCrawled ?? 0,
            ErrorsCount: latestCrawl?.ErrorsCount ?? 0,
            WarningsCount: latestCrawl?.WarningsCount ?? 0,
            NoticesCount: latestCrawl?.NoticesCount ?? 0,
            LastCrawledAt: latestCrawl?.CompletedAt,
            Status: latestCrawl?.Status
        );

        // 2. Rank Tracking Summary
        var totalKeywords = await _context.Keywords
            .AsNoTracking()
            .Where(k => k.ProjectId == request.ProjectId)
            .CountAsync(cancellationToken);

        var rankStartDate = today.AddDays(-30);
        var allRankResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= rankStartDate)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        var latestByKeyword = allRankResults
            .GroupBy(r => r.KeywordId)
            .Select(g => g.OrderByDescending(r => r.CheckDate).First())
            .ToList();

        var rankingKeywords = latestByKeyword
            .Where(r => r.Position.HasValue && r.Position.Value > 0)
            .ToList();

        int top3 = rankingKeywords.Count(r => r.Position!.Value <= 3);
        int top10 = rankingKeywords.Count(r => r.Position!.Value <= 10);
        int top20 = rankingKeywords.Count(r => r.Position!.Value <= 20);
        int top100 = rankingKeywords.Count(r => r.Position!.Value <= 100);

        int improved = latestByKeyword.Count(r => r.PositionChange.HasValue && r.PositionChange.Value > 0);
        int declined = latestByKeyword.Count(r => r.PositionChange.HasValue && r.PositionChange.Value < 0);
        int unchanged = latestByKeyword.Count(r => !r.PositionChange.HasValue || r.PositionChange.Value == 0);

        decimal? avgPos = rankingKeywords.Count > 0
            ? Math.Round((decimal)rankingKeywords.Average(r => r.Position!.Value), 1)
            : null;

        var keywordsWithPrev = latestByKeyword
            .Where(r => r.PreviousPosition.HasValue && r.PreviousPosition.Value > 0)
            .ToList();

        decimal? prevAvgPos = keywordsWithPrev.Count > 0
            ? Math.Round((decimal)keywordsWithPrev.Average(r => r.PreviousPosition!.Value), 1)
            : null;

        decimal? avgPosChange = (prevAvgPos.HasValue && avgPos.HasValue)
            ? Math.Round(prevAvgPos.Value - avgPos.Value, 1)
            : null;

        // Reused Visibility Score formula matching GetRankingsOverviewQuery
        decimal? visibilityScore = null;
        if (totalKeywords > 0)
        {
            if (rankingKeywords.Count > 0)
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
                visibilityScore = Math.Round(totalCtr / totalKeywords, 1);
            }
            else
            {
                visibilityScore = 0m;
            }
        }

        var lastRankObservation = allRankResults.OrderByDescending(r => r.RecordedAt).FirstOrDefault();
        var lastRankCheckAt = lastRankObservation?.RecordedAt;
        bool isRankingsStale = lastRankCheckAt.HasValue && (DateTimeOffset.UtcNow - lastRankCheckAt.Value).TotalHours > 48;

        var rankingsDto = new DashboardRankingsDto(
            TotalKeywords: totalKeywords,
            AveragePosition: avgPos,
            PreviousAveragePosition: prevAvgPos,
            AveragePositionChange: avgPosChange,
            SearchVisibility: visibilityScore,
            Top3Count: top3,
            Top10Count: top10,
            Top20Count: top20,
            Top100Count: top100,
            ImprovedCount: improved,
            DeclinedCount: declined,
            UnchangedCount: unchanged,
            LastRankCheckAt: lastRankCheckAt,
            IsStale: isRankingsStale
        );

        // 3. GSC 28-Day Performance Summary
        var gscConnection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        var gscEndDate = today.AddDays(-1);
        var gscStartDate = gscEndDate.AddDays(-27);

        var gscDailyMetrics = await _context.GscDailyMetrics
            .AsNoTracking()
            .Where(d => d.ProjectId == request.ProjectId && d.MetricDate >= gscStartDate && d.MetricDate <= gscEndDate && d.Device == "ALL")
            .OrderBy(d => d.MetricDate)
            .ToListAsync(cancellationToken);

        int gscClicks = gscDailyMetrics.Sum(d => d.Clicks);
        int gscImpressions = gscDailyMetrics.Sum(d => d.Impressions);
        decimal gscCtr = gscImpressions > 0 ? Math.Round((decimal)gscClicks / gscImpressions, 4) : 0m;
        decimal gscAvgPos = gscDailyMetrics.Count > 0 ? Math.Round(gscDailyMetrics.Average(d => d.AveragePosition), 2) : 0m;

        var gscDailySeries = gscDailyMetrics.Select(d => new GscDailyPointDto(
            d.MetricDate,
            d.Clicks,
            d.Impressions,
            d.Ctr,
            d.AveragePosition
        )).ToList();

        var gscDto = new DashboardGscDto(
            TotalClicks: gscClicks,
            TotalImpressions: gscImpressions,
            AverageCtr: gscCtr,
            AveragePosition: gscAvgPos,
            LastSyncedAt: gscConnection?.LastSyncedAt,
            SyncStatus: gscConnection?.SyncStatus ?? GoogleConstants.SyncStatuses.Disconnected,
            StartDate: gscStartDate,
            EndDate: gscEndDate,
            DailySeries: gscDailySeries
        );

        // 4. Critical Audit Issues (Top 5 Unresolved Errors)
        var criticalIssues = await _context.AuditIssues
            .AsNoTracking()
            .Where(i => i.ProjectId == request.ProjectId && i.Severity == "Error" && i.Status == "Open")
            .OrderByDescending(i => i.FirstSeenAt)
            .Take(5)
            .Select(i => new DashboardCriticalIssueDto(
                i.Id,
                i.CrawlRunId,
                i.RuleCode,
                i.Severity,
                i.AffectedUrl,
                i.Status,
                i.FirstSeenAt
            ))
            .ToListAsync(cancellationToken);

        // 5. Remediation Tasks Summary
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        int tasksOpen = tasks.Count(t => t.Status == "Open" || t.Status == "Assigned" || t.Status == "Reopened");
        int tasksInProgress = tasks.Count(t => t.Status == "InProgress");
        int tasksReady = tasks.Count(t => t.Status == "ReadyForVerification");
        int tasksClosed = tasks.Count(t => t.Status == "Closed" || t.Status == "Verified");
        int tasksOverdue = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < today && t.Status != "Closed" && t.Status != "Verified");

        var tasksDto = new DashboardTasksDto(
            OpenCount: tasksOpen,
            InProgressCount: tasksInProgress,
            ReadyForVerificationCount: tasksReady,
            ClosedCount: tasksClosed,
            OverdueCount: tasksOverdue,
            TotalCount: tasks.Count
        );

        // 6. Subsystem Freshness Summary
        var freshnessDto = new DashboardFreshnessDto(
            LastRankCheckAt: lastRankCheckAt,
            IsRankingsStale: isRankingsStale,
            LastAuditCrawlAt: latestCrawl?.CompletedAt,
            LastGscSyncAt: gscConnection?.LastSyncedAt,
            GscSyncStatus: gscConnection?.SyncStatus ?? GoogleConstants.SyncStatuses.Disconnected
        );

        var dashboardDto = new ProjectDashboardDto(
            ProjectId: project.Id,
            ProjectName: project.Name,
            PrimaryDomain: project.PrimaryDomain,
            Health: healthDto,
            Rankings: rankingsDto,
            Gsc: gscDto,
            CriticalIssues: criticalIssues,
            Tasks: tasksDto,
            Freshness: freshnessDto
        );

        return ApiResponse<ProjectDashboardDto>.Succeeded(dashboardDto);
    }
}
