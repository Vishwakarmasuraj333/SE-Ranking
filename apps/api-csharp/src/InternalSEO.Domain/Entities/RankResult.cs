namespace InternalSEO.Domain.Entities;

public class RankResult
{
    public long Id { get; set; }
    public Guid KeywordId { get; set; }
    public Guid ProjectId { get; set; }
    public DateOnly CheckDate { get; set; }
    public int? Position { get; set; } // 1..100; NULL represents unranked (>100)
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; } // previous_position - position (positive = improved)
    public string? RankedUrl { get; set; }
    public bool IsTargetUrlMatched { get; set; }
    public bool IsCannibalized { get; set; }
    public string? SerpFeatures { get; set; }
    public string ProviderName { get; set; } = "development";
    public string? ProviderTaskId { get; set; }
    public string? RawResponseRef { get; set; }
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual Keyword Keyword { get; set; } = null!;
    public virtual Project Project { get; set; } = null!;
}
