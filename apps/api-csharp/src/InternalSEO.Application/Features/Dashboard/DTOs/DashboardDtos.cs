using InternalSEO.Application.Features.GoogleIntegrations.DTOs;

namespace InternalSEO.Application.Features.Dashboard.DTOs;

public record ProjectDashboardDto(
    Guid ProjectId,
    string ProjectName,
    string PrimaryDomain,
    DashboardHealthDto Health,
    DashboardRankingsDto Rankings,
    DashboardGscDto Gsc,
    IReadOnlyList<DashboardCriticalIssueDto> CriticalIssues,
    DashboardTasksDto Tasks,
    DashboardFreshnessDto Freshness
);

public record DashboardHealthDto(
    decimal? HealthScore,
    int TotalUrlsCrawled,
    int ErrorsCount,
    int WarningsCount,
    int NoticesCount,
    DateTimeOffset? LastCrawledAt,
    string? Status
);

public record DashboardRankingsDto(
    int TotalKeywords,
    decimal? AveragePosition,
    decimal? PreviousAveragePosition,
    decimal? AveragePositionChange,
    decimal? SearchVisibility,
    int Top3Count,
    int Top10Count,
    int Top20Count,
    int Top100Count,
    int ImprovedCount,
    int DeclinedCount,
    int UnchangedCount,
    DateTimeOffset? LastRankCheckAt,
    bool IsStale
);

public record DashboardGscDto(
    int TotalClicks,
    int TotalImpressions,
    decimal AverageCtr,
    decimal AveragePosition,
    DateTimeOffset? LastSyncedAt,
    string SyncStatus,
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<GscDailyPointDto> DailySeries
);

public record DashboardCriticalIssueDto(
    Guid Id,
    Guid CrawlRunId,
    string RuleCode,
    string Severity,
    string AffectedUrl,
    string Status,
    DateTimeOffset FirstSeenAt
);

public record DashboardTasksDto(
    int OpenCount,
    int InProgressCount,
    int ReadyForVerificationCount,
    int ClosedCount,
    int OverdueCount,
    int TotalCount
);

public record DashboardFreshnessDto(
    DateTimeOffset? LastRankCheckAt,
    bool IsRankingsStale,
    DateTimeOffset? LastAuditCrawlAt,
    DateTimeOffset? LastGscSyncAt,
    string GscSyncStatus
);

public record GlobalDashboardDto(
    int TotalProjects,
    int TotalTrackedKeywords,
    decimal? AverageHealthScore,
    int TotalOpenTasks,
    int TotalOverdueTasks,
    IReadOnlyList<GlobalProjectSummaryDto> Projects
);

public record GlobalProjectSummaryDto(
    Guid ProjectId,
    string Name,
    string PrimaryDomain,
    decimal? HealthScore,
    int TrackedKeywords,
    int OpenTasks,
    int OverdueTasks,
    DateTimeOffset? LastCrawledAt,
    DateTimeOffset? LastSyncedAt,
    string GscSyncStatus
);
