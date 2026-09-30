namespace InternalSEO.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? SourceIssueId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AffectedUrl { get; set; }
    public string Priority { get; set; } = "Medium"; // 'Critical', 'High', 'Medium', 'Low'
    public string Status { get; set; } = "Open"; // 'Open', 'Assigned', 'InProgress', 'ReadyForVerification', 'Verified', 'Closed', 'Blocked', 'Reopened'
    public Guid? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? AcceptanceCriteria { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid CreatedBy { get; set; }

    // Navigation Properties
    public virtual Project Project { get; set; } = null!;
    public virtual AuditIssue? SourceIssue { get; set; }
    public virtual User? Assignee { get; set; }
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<TaskVerification> Verifications { get; set; } = new List<TaskVerification>();
    public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}
