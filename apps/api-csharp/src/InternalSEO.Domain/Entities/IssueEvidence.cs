namespace InternalSEO.Domain.Entities;

public class IssueEvidence
{
    public long Id { get; set; }
    public Guid IssueId { get; set; }
    public string EvidenceType { get; set; } = "DOM_Snippet"; // 'DOM_Snippet', 'HTTP_Headers', 'Redirect_Chain'
    public string EvidencePayload { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual AuditIssue Issue { get; set; } = null!;
}
