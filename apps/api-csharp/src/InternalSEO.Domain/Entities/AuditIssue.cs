namespace InternalSEO.Domain.Entities;

public class AuditIssue
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CrawlRunId { get; set; }
    public Guid ProjectId { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string Severity { get; set; } = "Warning"; // 'Error', 'Warning', 'Notice'
    public string AffectedUrl { get; set; } = string.Empty;
    public string AffectedUrlHash { get; set; } = string.Empty;
    public string Status { get; set; } = "Open"; // 'Open', 'Ignored', 'Resolved'
    public DateTimeOffset FirstSeenAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastSeenAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual CrawlRun CrawlRun { get; set; } = null!;
    public virtual Project Project { get; set; } = null!;
    public virtual AuditRule Rule { get; set; } = null!;
    public virtual ICollection<IssueEvidence> Evidence { get; set; } = new List<IssueEvidence>();
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
