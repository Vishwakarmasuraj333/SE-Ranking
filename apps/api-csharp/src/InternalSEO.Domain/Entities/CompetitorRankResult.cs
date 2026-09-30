namespace InternalSEO.Domain.Entities;

public class CompetitorRankResult
{
    public long Id { get; set; }
    public Guid CompetitorId { get; set; }
    public Guid KeywordId { get; set; }
    public Guid ProjectId { get; set; }
    public DateOnly CheckDate { get; set; }
    public int? Position { get; set; } // 1..100; NULL represents unranked (>100)
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; } // previous_position - position (positive = improved)
    public string? RankedUrl { get; set; }
    public string ProviderName { get; set; } = "development";
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;

 // Navigation
 public virtual Competitor Competitor { get; set; } = null!;
 public virtual Keyword Keyword { get; set; } = null!;
 public virtual Project Project { get; set; } = null!;
}