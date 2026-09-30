namespace InternalSEO.Domain.Entities;

public class KeywordTag
{
    public Guid KeywordId { get; set; }
    public virtual Keyword Keyword { get; set; } = null!;

    public Guid TagId { get; set; }
    public virtual Tag Tag { get; set; } = null!;
}
