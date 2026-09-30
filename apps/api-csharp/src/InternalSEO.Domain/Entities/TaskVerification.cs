namespace InternalSEO.Domain.Entities;

public class TaskVerification
{
    public long Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid? VerifiedByRunId { get; set; }
    public DateTimeOffset AttemptedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }
    public string Status { get; set; } = "Queued"; // 'Queued', 'Passed', 'Failed', 'Error'
    public string? Details { get; set; }
    public Guid? VerifiedByUserId { get; set; }

    // Navigation Properties
    public virtual TaskItem Task { get; set; } = null!;
    public virtual CrawlRun? VerifiedByRun { get; set; }
    public virtual User? VerifiedByUser { get; set; }
}
