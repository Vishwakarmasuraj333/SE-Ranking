namespace InternalSEO.Application.Features.Audit.DTOs;

public class AuditOverviewDto
{
    public CrawlRunDto? LastCrawlRun { get; set; }
    public decimal? HealthScore { get; set; }
    public int UrlsCrawled { get; set; }
    public int ErrorsCount { get; set; }
    public int WarningsCount { get; set; }
    public int NoticesCount { get; set; }
    public Dictionary<string, int> IssuesByCategory { get; set; } = new();
    public Dictionary<string, int> IssueCountsBySeverity { get; set; } = new();
    public List<AuditIssueDto> TopIssues { get; set; } = new();
    public List<CrawlRunDto> RecentRuns { get; set; } = new();
}

public class CrawlRunDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string TriggerSource { get; set; } = string.Empty;
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public int UrlsDiscovered { get; set; }
    public int UrlsCrawled { get; set; }
    public int ErrorsCount { get; set; }
    public int WarningsCount { get; set; }
    public int NoticesCount { get; set; }
    public decimal? HealthScore { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class AuditIssueDto
{
    public Guid Id { get; set; }
    public Guid CrawlRunId { get; set; }
    public Guid ProjectId { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string RuleTitle { get; set; } = string.Empty;
    public string RuleCategory { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string AffectedUrl { get; set; } = string.Empty;
    public string AffectedUrlHash { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset FirstSeenAt { get; set; }
    public DateTimeOffset LastSeenAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public int EvidenceCount { get; set; }
}

public class AuditIssueDetailDto
{
    public Guid Id { get; set; }
    public Guid CrawlRunId { get; set; }
    public Guid ProjectId { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string RuleTitle { get; set; } = string.Empty;
    public string RuleCategory { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string AffectedUrl { get; set; } = string.Empty;
    public string AffectedUrlHash { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public DateTimeOffset FirstSeenAt { get; set; }
    public DateTimeOffset LastSeenAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<IssueEvidenceDto> Evidence { get; set; } = new();
}

public class IssueEvidenceDto
{
    public long Id { get; set; }
    public Guid IssueId { get; set; }
    public string EvidenceType { get; set; } = string.Empty;
    public string EvidencePayload { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class CrawlPageDto
{
    public long Id { get; set; }
    public Guid CrawlRunId { get; set; }
    public string Url { get; set; } = string.Empty;
    public int HttpStatusCode { get; set; }
    public string? ContentType { get; set; }
    public long? ContentLengthBytes { get; set; }
    public int? LoadTimeMs { get; set; }
    public int CrawlDepth { get; set; }
    public string? Title { get; set; }
    public int? TitleLength { get; set; }
    public string? MetaDescription { get; set; }
    public string? H1 { get; set; }
    public int H1Count { get; set; }
    public string? CanonicalUrl { get; set; }
    public bool IsIndexable { get; set; }
    public string? IndexabilityStatus { get; set; }
    public int InlinksCount { get; set; }
    public int OutlinksCount { get; set; }
    public DateTimeOffset CrawledAt { get; set; }
}

public class ProjectSettingsDto
{
    public Guid ProjectId { get; set; }
    public int CrawlMaxPages { get; set; }
    public int CrawlMaxDepth { get; set; }
    public int CrawlConcurrency { get; set; }
    public int CrawlRateLimitMs { get; set; }
    public bool CrawlRespectRobotsTxt { get; set; }
    public string CrawlUserAgent { get; set; } = string.Empty;
    public string RankTrackingFrequency { get; set; } = string.Empty;
    public TimeSpan RankTrackingTime { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
