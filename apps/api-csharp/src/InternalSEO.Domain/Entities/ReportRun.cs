namespace InternalSEO.Domain.Entities;

public class ReportRun
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
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation Properties
    public virtual Project Project { get; set; } = null!;
    public virtual User CreatedByUser { get; set; } = null!;
}
