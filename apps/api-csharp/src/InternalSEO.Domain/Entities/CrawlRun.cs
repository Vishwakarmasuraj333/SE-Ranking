namespace InternalSEO.Domain.Entities;

public class CrawlRun
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = "Queued"; // 'Queued', 'Crawling', 'Evaluating', 'Completed', 'Failed', 'Cancelled'
    public string TriggerSource { get; set; } = "Manual"; // 'Scheduled', 'Manual', 'Verification'
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public int UrlsDiscovered { get; set; }
    public int UrlsCrawled { get; set; }
    public int ErrorsCount { get; set; }
    public int WarningsCount { get; set; }
    public int NoticesCount { get; set; }
    public decimal? HealthScore { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? CreatedBy { get; set; }

    // Navigation
    public virtual Project Project { get; set; } = null!;
    public virtual User? Creator { get; set; }
    public virtual ICollection<CrawlPage> Pages { get; set; } = new List<CrawlPage>();
    public virtual ICollection<AuditIssue> Issues { get; set; } = new List<AuditIssue>();
}
