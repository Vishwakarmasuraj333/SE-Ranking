namespace InternalSEO.Domain.Entities;

public class Notification
{
    public long Id { get; set; }
    public Guid? UserId { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Info"; // 'Critical', 'Warning', 'Info'
    public string EventType { get; set; } = string.Empty; // 'KeywordDrop', 'AuditComplete', 'TaskAssigned', 'TaskOverdue', 'CrawlFailed', 'HealthScoreDrop', 'SyncFailed'
    public string? TargetUrl { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTimeOffset? ReadAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation Properties
    public virtual User? User { get; set; }
    public virtual Project Project { get; set; } = null!;
}
