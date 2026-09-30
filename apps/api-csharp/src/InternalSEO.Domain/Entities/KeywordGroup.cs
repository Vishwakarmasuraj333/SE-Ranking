namespace InternalSEO.Domain.Entities;

public class KeywordGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; } = "#3B82F6";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<Keyword> Keywords { get; set; } = new List<Keyword>();
}
