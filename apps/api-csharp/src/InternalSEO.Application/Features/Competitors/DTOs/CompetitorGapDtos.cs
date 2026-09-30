namespace InternalSEO.Application.Features.Competitors.DTOs;

public class CompetitorGapResponseDto
{
    public List<CompetitorGapItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public List<CompetitorDto> Competitors { get; set; } = new();
    public DateOnly? LatestCheckDate { get; set; }
    public DateTimeOffset? LastCheckedAt { get; set; }
    public bool IsStale { get; set; }
}

public class CompetitorGapItemDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public bool IsActive { get; set; } // true = Tracked, false = "+ Add to Tracked"
    public int? SearchVolume { get; set; }
    public decimal? KeywordDifficulty { get; set; }
    public decimal? CpcUsd { get; set; }

    // Target domain position (null if unranked, or > 20)
    public int? TargetPosition { get; set; }
    public string? TargetRankedUrl { get; set; }

    // Best competitor information
    public Guid BestCompetitorId { get; set; }
    public string BestCompetitorName { get; set; } = string.Empty;
    public string BestCompetitorDomain { get; set; } = string.Empty;
    public int BestCompetitorPosition { get; set; }
    public string? BestCompetitorRankedUrl { get; set; }

    // Calculated Opportunity Score
    public double OpportunityScore { get; set; }

    // All competitors that rank for this keyword in Top 20
    public List<CompetitorGapRankDto> CompetitorRanks { get; set; } = new();

    // Check date
    public DateOnly CheckDate { get; set; }
}

public class CompetitorGapRankDto
{
    public Guid CompetitorId { get; set; }
    public string CompetitorName { get; set; } = string.Empty;
    public string CompetitorDomain { get; set; } = string.Empty;
    public int? Position { get; set; }
    public string? RankedUrl { get; set; }
}
