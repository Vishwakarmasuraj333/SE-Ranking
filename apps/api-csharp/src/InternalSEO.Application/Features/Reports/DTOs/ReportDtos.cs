namespace InternalSEO.Application.Features.Reports.DTOs;

public class ReportSummaryDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ExecutiveSummary { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string Sections { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class ReportDetailDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ExecutiveSummary { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string Sections { get; set; } = string.Empty;
    public string SnapshotJson { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class ReportSnapshotData
{
    public Guid ReportId { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectDomain { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? ExecutiveNotes { get; set; }
    public DateTimeOffset GeneratedAtUtc { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTimeOffset StartDateUtc { get; set; }
    public DateTimeOffset EndDateUtc { get; set; }
    public List<string> SectionsIncluded { get; set; } = new();

    public ReportKpiSummary? KpiSummary { get; set; }
    public ReportRankingsSection? Rankings { get; set; }
    public ReportGscSection? GoogleSearchConsole { get; set; }
    public ReportAuditSection? TechnicalAudit { get; set; }
    public ReportTasksSection? Tasks { get; set; }
}

public class ReportKpiSummary
{
    public decimal? HealthScore { get; set; }
    public decimal? SearchVisibility { get; set; }
    public long? GscTotalClicks { get; set; }
    public long? GscTotalImpressions { get; set; }
    public int CompletedTasksCount { get; set; }
}

public class ReportRankingsSection
{
    public decimal? SearchVisibility { get; set; }
    public int TotalKeywords { get; set; }
    public int Top3 { get; set; }
    public int Top10 { get; set; }
    public int Top20 { get; set; }
    public int Top100 { get; set; }
    public int Improved { get; set; }
    public int Declined { get; set; }
    public int Unranked { get; set; }
    public List<ReportRankKeywordItem> TopKeywords { get; set; } = new();
}

public class ReportRankKeywordItem
{
    public Guid KeywordId { get; set; }
    public string Term { get; set; } = string.Empty;
    public int? CurrentPosition { get; set; }
    public int? PreviousPosition { get; set; }
    public int Movement { get; set; }
    public string? BestUrl { get; set; }
}

public class ReportGscSection
{
    public long TotalClicks { get; set; }
    public long TotalImpressions { get; set; }
    public decimal AverageCtr { get; set; }
    public decimal AveragePosition { get; set; }
    public bool HasData { get; set; }
    public List<ReportGscTrendPoint> DailyTrends { get; set; } = new();
    public List<ReportGscQueryItem> TopQueries { get; set; } = new();
    public List<ReportGscPageItem> TopPages { get; set; } = new();
}

public class ReportGscTrendPoint
{
    public DateOnly Date { get; set; }
    public long Clicks { get; set; }
    public long Impressions { get; set; }
    public decimal Ctr { get; set; }
    public decimal Position { get; set; }
}

public class ReportGscQueryItem
{
    public string Query { get; set; } = string.Empty;
    public long Clicks { get; set; }
    public long Impressions { get; set; }
    public decimal Ctr { get; set; }
    public decimal Position { get; set; }
}

public class ReportGscPageItem
{
    public string PageUrl { get; set; } = string.Empty;
    public long Clicks { get; set; }
    public long Impressions { get; set; }
    public decimal Ctr { get; set; }
    public decimal Position { get; set; }
}

public class ReportAuditSection
{
    public decimal? HealthScore { get; set; }
    public int TotalCrawledUrls { get; set; }
    public int TotalErrors { get; set; }
    public int TotalWarnings { get; set; }
    public int TotalNotices { get; set; }
    public bool HasCrawl { get; set; }
    public DateTimeOffset? CrawlCompletedAt { get; set; }
    public List<ReportAuditIssueItem> TopIssues { get; set; } = new();
}

public class ReportAuditIssueItem
{
    public Guid IssueId { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string RuleName { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int AffectedUrlsCount { get; set; }
}

public class ReportTasksSection
{
    public int CompletedCount { get; set; }
    public int OpenCount { get; set; }
    public int OverdueCount { get; set; }
    public List<ReportTaskItem> TasksSummary { get; set; } = new();
}

public class ReportTaskItem
{
    public Guid TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateOnly? DueDate { get; set; }
    public bool IsOverdue { get; set; }
}
