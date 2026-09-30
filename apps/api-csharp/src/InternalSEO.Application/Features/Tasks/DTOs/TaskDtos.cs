namespace InternalSEO.Application.Features.Tasks.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? SourceIssueId { get; set; }
    public string? SourceIssueRuleCode { get; set; }
    public string? SourceIssueSeverity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AffectedUrl { get; set; }
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "Open";
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeEmail { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? AcceptanceCriteria { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public TaskVerificationDto? LatestVerification { get; set; }
}

public class TaskDetailDto : TaskDto
{
    public string? SourceIssueRuleTitle { get; set; }
    public string? SourceIssueRecommendation { get; set; }
    public List<TaskVerificationDto> Verifications { get; set; } = new();
    public List<TaskIssueEvidenceDto> Evidence { get; set; } = new();
    public List<TaskCommentDto> Comments { get; set; } = new();
}

public class TaskCommentDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string AuthorName => UserName;
    public string AuthorEmail => UserEmail;
    public string CommentText { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class TaskIssueEvidenceDto
{
    public long Id { get; set; }
    public string EvidenceType { get; set; } = string.Empty;
    public string EvidencePayload { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class TaskVerificationDto
{
    public long Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid? VerifiedByRunId { get; set; }
    public DateTimeOffset AttemptedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string Status { get; set; } = "Queued";
    public string? Details { get; set; }
    public Guid? VerifiedByUserId { get; set; }
    public string? VerifiedByUserName { get; set; }
}
