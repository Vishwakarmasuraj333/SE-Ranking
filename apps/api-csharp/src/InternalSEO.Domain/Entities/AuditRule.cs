namespace InternalSEO.Domain.Entities;

public class AuditRule
{
    public string Id { get; set; } = string.Empty; // e.g. 'RULE-HTTP-404'
    public string Category { get; set; } = "Indexability"; // 'Indexability', 'Links', 'Content', 'Security', 'Performance'
    public string DefaultSeverity { get; set; } = "Warning"; // 'Error', 'Warning', 'Notice'
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<AuditIssue> Issues { get; set; } = new List<AuditIssue>();
}
