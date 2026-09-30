namespace InternalSEO.Application.Features.Competitors.DTOs;

public class CompetitorDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public DateTimeOffset? LastCheckedAt { get; set; }
}

public class CompetitorVisibilityPointDto
{
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public decimal Visibility { get; set; }
    public decimal? AveragePosition { get; set; }
    public int RankedKeywordsCount { get; set; }
}

public class CompetitorVisibilitySummaryDto
{
    public Guid? CompetitorId { get; set; } // null for target domain
    public string Domain { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsTargetDomain { get; set; }
    public decimal CurrentVisibility { get; set; }
    public decimal? CurrentAveragePosition { get; set; }
    public int CurrentRankedCount { get; set; }
    public int Top3Count { get; set; }
    public int Top10Count { get; set; }
    public int Top20Count { get; set; }
    public int Top30Count { get; set; }
    public int Top100Count { get; set; }
    public int UnrankedCount { get; set; }
    public int Top20OverlapCount { get; set; }
    public decimal Top20OverlapPercentage { get; set; }
    public List<CompetitorVisibilityPointDto> History { get; set; } = new();
}

public class CompetitorOverviewDto
{
    public Guid ProjectId { get; set; }
    public string TargetDomain { get; set; } = string.Empty;
    public int TotalKeywordsCount { get; set; }
    public DateTimeOffset? LastCheckedAt { get; set; }
    public DateOnly? LatestCheckDate { get; set; }
    public bool IsStale { get; set; } // >48h or null
    public List<CompetitorVisibilitySummaryDto> Summaries { get; set; } = new();
}

// Semantic alias for REQ-CMP-003
public class CompetitorVisibilityResponseDto : CompetitorOverviewDto { }


public class CompetitorKeywordRankingDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public int? SearchVolume { get; set; }
    public int? TargetPosition { get; set; }
    public int? TargetPreviousPosition { get; set; }
    public int? TargetPositionChange { get; set; }
    public string? TargetRankedUrl { get; set; }
    public Dictionary<Guid, CompetitorRankCellDto> CompetitorRanks { get; set; } = new();
}

public class CompetitorRankCellDto
{
    public Guid CompetitorId { get; set; }
    public int? Position { get; set; }
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; }
    public string? RankedUrl { get; set; }
}

public class CompetitorKeywordsResponseDto
{
    public List<CompetitorKeywordRankingDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public List<CompetitorDto> Competitors { get; set; } = new();
    public DateTimeOffset? LastCheckedAt { get; set; }
    public bool IsStale { get; set; }
}
