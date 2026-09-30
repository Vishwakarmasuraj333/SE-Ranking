namespace InternalSEO.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<KeywordTag> KeywordTags { get; set; } = new List<KeywordTag>();
}
