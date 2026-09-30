using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Features.Rankings.DTOs;

public class RankingsOverviewDto
{
    public decimal? AveragePosition { get; set; }
    public decimal? PreviousAveragePosition { get; set; }
    public decimal? AveragePositionChange { get; set; }
    public decimal? SearchVisibility { get; set; }
    public decimal? Top10Percentage { get; set; }
    public int Top5Count { get; set; }
    public int Top10Count { get; set; }
    public int Top30Count { get; set; }
    public int TotalTrackedKeywords { get; set; }
    public DateTimeOffset? LastUpdated { get; set; }
    public bool IsStale { get; set; }
    public string PrimaryDomain { get; set; } = string.Empty;
    public List<RankingTrendPointDto> Trend { get; set; } = new();
    public List<KeywordRankSummaryDto> Top5Keywords { get; set; } = new();
}

public class RankingTrendPointDto
{
    public string Date { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class KeywordRankSummaryDto
{
    public string Keyword { get; set; } = string.Empty;
    public int Position { get; set; }
    public int Change { get; set; }
}

public class KeywordRankDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public string? GroupName { get; set; }
    public string SearchEngine { get; set; } = "google";
    public string Device { get; set; } = "desktop";
    public string CountryCode { get; set; } = "US";
    public string? TargetUrl { get; set; }
    public string? RankedUrl { get; set; }
    public int? CurrentPosition { get; set; }
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; }
    public bool IsTargetUrlMatched { get; set; }
    public string? CheckDate { get; set; }
    public DateTimeOffset? LastCheckedAt { get; set; }
}

public class RankObservationHistoryDto
{
    public string CheckDate { get; set; } = string.Empty;
    public int? Position { get; set; }
    public int? PositionChange { get; set; }
    public string? RankedUrl { get; set; }
    public string Device { get; set; } = "desktop";
    public string? Location { get; set; }
    public string SearchEngine { get; set; } = "google";
    public string Provider { get; set; } = string.Empty;
    public DateTimeOffset RecordedAt { get; set; }
}

public class RankingsSummaryDto
{
    public Guid ProjectId { get; set; }
    public string PrimaryDomain { get; set; } = string.Empty;
    public DateTimeOffset? LastCheckedAt { get; set; }
    public bool IsStale { get; set; }

    // Header KPI Cards
    public decimal SearchVisibility { get; set; }
    public decimal SearchVisibilityChange { get; set; }
    public decimal? AveragePosition { get; set; }
    public decimal? AveragePositionChange { get; set; }
    public int TotalKeywordsInSerp { get; set; } // keywords ranking <= 100
    public int TotalKeywordsTracked { get; set; }

    // Position Distribution (Top 1, Top 2-3, Top 4-5, Top 6-10, Top 11-30, Top 31-100, >100)
    public PositionDistributionBucketsDto Distribution { get; set; } = new();
    public List<PositionDistributionTrendPointDto> DistributionTrend { get; set; } = new();

    // SERP Movement Summary
    public SerpMovementSummaryDto Movement { get; set; } = new();

    // Top / Jumped / Dropped Keywords Preview (Top 5 each)
    public List<RankingsKeywordPreviewDto> TopKeywords { get; set; } = new();
    public List<RankingsKeywordPreviewDto> JumpedKeywords { get; set; } = new();
    public List<RankingsKeywordPreviewDto> DroppedKeywords { get; set; } = new();

    // Pages Overview (top ranked URLs grouped)
    public List<RankingsPageSummaryDto> TopPages { get; set; } = new();

    // Competitors Snapshot
    public List<RankingsCompetitorSnapshotDto> Competitors { get; set; } = new();

    // Algorithm Notes Widget
    public List<AlgorithmNoteDto> AlgorithmNotes { get; set; } = new();
}

public class PositionDistributionBucketsDto
{
    public int Top1 { get; set; }
    public int Top2_3 { get; set; }
    public int Top4_5 { get; set; }
    public int Top6_10 { get; set; }
    public int Top11_30 { get; set; }
    public int Top31_100 { get; set; }
    public int GreaterThan100 { get; set; } // > 100 / Unranked
}

public class PositionDistributionTrendPointDto
{
    public string Date { get; set; } = string.Empty;
    public int Top1 { get; set; }
    public int Top2_3 { get; set; }
    public int Top4_5 { get; set; }
    public int Top6_10 { get; set; }
    public int Top11_30 { get; set; }
    public int Top31_100 { get; set; }
    public int GreaterThan100 { get; set; }
}

public class SerpMovementSummaryDto
{
    public int JumpedCount { get; set; }
    public decimal JumpedPercentage { get; set; }
    public int DroppedCount { get; set; }
    public decimal DroppedPercentage { get; set; }
    public int UnchangedCount { get; set; }
    public decimal UnchangedPercentage { get; set; }

    public SerpMovementBucketBreakdownDto JumpedByBucket { get; set; } = new();
    public SerpMovementBucketBreakdownDto DroppedByBucket { get; set; } = new();
    public SerpMovementBucketBreakdownDto UnchangedByBucket { get; set; } = new();
}

public class SerpMovementBucketBreakdownDto
{
    public int Top1_3 { get; set; }
    public int Top4_10 { get; set; }
    public int Top11_30 { get; set; }
    public int Top31_100 { get; set; }
}

public class RankingsKeywordPreviewDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public int? Position { get; set; }
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; }
    public int? SearchVolume { get; set; }
    public string? RankedUrl { get; set; }
    public string? SerpFeatures { get; set; }
}

public class RankingsPageSummaryDto
{
    public string Url { get; set; } = string.Empty;
    public int TotalKeywords { get; set; }
    public decimal AveragePosition { get; set; }
    public int Top10Count { get; set; }
    public int? BestPosition { get; set; }
}

public class RankingsCompetitorSnapshotDto
{
    public Guid CompetitorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public decimal SearchVisibility { get; set; }
    public decimal? AveragePosition { get; set; }
    public int RankedCount { get; set; }
}

public class AlgorithmNoteDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "info"; // info, warning, notice
}

public class PositionBucketMetricDto
{
    public int Count { get; set; }
    public decimal Percentage { get; set; }
    public int Delta { get; set; }
}

public class PositionDistributionHeaderDto
{
    public PositionBucketMetricDto All { get; set; } = new();
    public PositionBucketMetricDto Top1 { get; set; } = new();
    public PositionBucketMetricDto Top3 { get; set; } = new();
    public PositionBucketMetricDto Top5 { get; set; } = new();
    public PositionBucketMetricDto Top10 { get; set; } = new();
    public PositionBucketMetricDto Top30 { get; set; } = new();
    public PositionBucketMetricDto Over100 { get; set; } = new();

    public int JumpedCount { get; set; }
    public decimal JumpedPercentage { get; set; }
    public int DroppedCount { get; set; }
    public decimal DroppedPercentage { get; set; }
    public int UnchangedCount { get; set; }
    public decimal UnchangedPercentage { get; set; }
}

public class RankingsInsightDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = "SERP Changes";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Guid> AffectedKeywordIds { get; set; } = new();
    public string Severity { get; set; } = "warning";
    public string ActionLabel { get; set; } = "View keywords";
}

public class KeywordDailyPositionDto
{
    public string Date { get; set; } = string.Empty;
    public string FormattedDate { get; set; } = string.Empty;
    public int? Position { get; set; }
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; }
}

public class RankingsDetailedKeywordDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public Guid? GroupId { get; set; }
    public string? GroupName { get; set; }
    public string? TargetUrl { get; set; }
    public string? RankedUrl { get; set; }
    public bool IsTargetUrlMatched { get; set; }
    public int? MonthlySearchVolume { get; set; }
    public List<string> SerpFeatures { get; set; } = new();
    public int? ContentScore { get; set; }
    public int? CurrentPosition { get; set; }
    public int? PreviousPosition { get; set; }
    public int? PositionChange { get; set; }
    public bool IsCannibalized { get; set; }
    public List<KeywordDailyPositionDto> DailyPositions { get; set; } = new();
    public string Device { get; set; } = "desktop";
    public string CountryCode { get; set; } = "US";
    public string SearchEngine { get; set; } = "google";
    public string? LastCheckedDate { get; set; }
}

public class RankingsDetailedResponseDto
{
    public PositionDistributionHeaderDto Header { get; set; } = new();
    public List<RankingsInsightDto> Insights { get; set; } = new();
    public RankingsOverviewDto? OverviewMetrics { get; set; }
    public PaginatedList<RankingsDetailedKeywordDto> Keywords { get; set; } = null!;
    public List<string> HistoryDates { get; set; } = new();
}

public class HistoricalComparisonMetricDto
{
    public decimal BaselineValue { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal Change { get; set; }
    public bool IsPositive { get; set; }
}

public class HistoricalMetricsSummaryDto
{
    public HistoricalComparisonMetricDto AveragePosition { get; set; } = new();
    public HistoricalComparisonMetricDto TrafficForecast { get; set; } = new();
    public HistoricalComparisonMetricDto SearchVisibility { get; set; } = new();
    public HistoricalComparisonMetricDto PercentInTop10 { get; set; } = new();
}

public class HistoricalTrajectoryPointDto
{
    public string Date { get; set; } = string.Empty;
    public string FormattedDate { get; set; } = string.Empty;
    public decimal? AveragePosition { get; set; }
    public decimal? TrafficForecast { get; set; }
    public decimal? SearchVisibility { get; set; }
    public decimal? PercentInTop10 { get; set; }
}

public class RankingsHistoricalKeywordDto
{
    public Guid KeywordId { get; set; }
    public string KeywordText { get; set; } = string.Empty;
    public Guid? GroupId { get; set; }
    public string? GroupName { get; set; }
    public string? TargetUrl { get; set; }
    public string? RankedUrl { get; set; }
    public int? MonthlySearchVolume { get; set; }
    public List<string> SerpFeatures { get; set; } = new();
    public int? ContentScore { get; set; }
    public int? BaselinePosition { get; set; }
    public int? CurrentPosition { get; set; }
    public int? PositionChange { get; set; }
    public bool IsTargetUrlMatched { get; set; }
    public string Device { get; set; } = "desktop";
    public string CountryCode { get; set; } = "US";
    public string SearchEngine { get; set; } = "google";
}

public class RankingsHistoricalResponseDto
{
    public string DateFrom { get; set; } = string.Empty;
    public string DateTo { get; set; } = string.Empty;
    public List<string> AvailableDates { get; set; } = new();
    public PositionDistributionHeaderDto Header { get; set; } = new();
    public HistoricalMetricsSummaryDto Metrics { get; set; } = new();
    public List<HistoricalTrajectoryPointDto> Trajectory { get; set; } = new();
    public PaginatedList<RankingsHistoricalKeywordDto> Keywords { get; set; } = null!;
}

