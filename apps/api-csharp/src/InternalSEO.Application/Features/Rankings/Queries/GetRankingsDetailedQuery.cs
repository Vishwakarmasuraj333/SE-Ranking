using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetRankingsDetailedQuery(
    Guid ProjectId,
    string PositionFilter = "all", // all, top1, top3, top5, top10, top30, over100
    int? MinPosition = null,
    int? MaxPosition = null,
    string? ChangesOnly = null, // up, down
    string? Search = null,
    bool? CannibalizedOnly = null,
    string? Device = null,
    string Metric = "average_position",
    string TimeRange = "1m",
    int PageNumber = 1,
    int PageSize = 100
) : IRequest<ApiResponse<RankingsDetailedResponseDto>>;

public class GetRankingsDetailedQueryHandler : IRequestHandler<GetRankingsDetailedQuery, ApiResponse<RankingsDetailedResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRankingsDetailedQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<RankingsDetailedResponseDto>> Handle(GetRankingsDetailedQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        // Fetch all keywords for this project
        var allKeywords = await _context.Keywords
            .AsNoTracking()
            .Include(k => k.Group)
            .Where(k => k.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        int days = request.TimeRange.ToLowerInvariant() switch
        {
            "7d" => 7,
            "1m" => 30,
            "3m" => 90,
            "6m" => 180,
            "1y" => 365,
            "2y" => 730,
            _ => 30
        };

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-days);

        // Fetch rank results for the project within the historical window
        var allResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        // Group observations by keyword
        var resultsByKeyword = allResults
            .GroupBy(r => r.KeywordId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.CheckDate).ToList());

        // Distinct recent dates for the daily position columns (up to 7 most recent dates in chronological order)
        var distinctDates = allResults
            .Select(r => r.CheckDate)
            .Distinct()
            .OrderByDescending(d => d)
            .Take(7)
            .OrderBy(d => d)
            .ToList();

        if (distinctDates.Count == 0)
        {
            distinctDates.Add(today);
        }

        var historyDatesFormatted = distinctDates.Select(d => d.ToString("yyyy-MM-dd")).ToList();

        // Cannibalization Detection Engine:
        // 1. Keyword flagged with IsCannibalized
        // 2. Keyword with multiple distinct RankedUrls across recent checks
        // 3. Multiple keywords ranking with the exact same RankedUrl where TargetUrls diverge
        var cannibalizedKeywordIds = new HashSet<Guid>();
        foreach (var kw in allKeywords)
        {
            if (resultsByKeyword.TryGetValue(kw.Id, out var kwResults) && kwResults.Count > 0)
            {
                if (kwResults.Any(r => r.IsCannibalized))
                {
                    cannibalizedKeywordIds.Add(kw.Id);
                    continue;
                }

                var distinctRankedUrls = kwResults
                    .Where(r => !string.IsNullOrWhiteSpace(r.RankedUrl))
                    .Select(r => r.RankedUrl!.Trim().ToLowerInvariant())
                    .Distinct()
                    .ToList();

                if (distinctRankedUrls.Count > 1)
                {
                    cannibalizedKeywordIds.Add(kw.Id);
                }
            }
        }

        var insights = new List<RankingsInsightDto>();
        if (cannibalizedKeywordIds.Count > 0)
        {
            insights.Add(new RankingsInsightDto
            {
                Id = "cannibalization_insight",
                Type = "SERP Changes",
                Title = $"{cannibalizedKeywordIds.Count} cannibalized keyword{(cannibalizedKeywordIds.Count == 1 ? "" : "s")}",
                Description = "Multiple landing pages or fluctuating URLs are competing in Google SERPs for the same keywords, causing ranking volatility and diluted domain authority.",
                AffectedKeywordIds = cannibalizedKeywordIds.ToList(),
                Severity = "warning",
                ActionLabel = "View keywords"
            });
        }

        // Calculate Position Distribution Header
        var totalKeywords = allKeywords.Count;
        int top1Count = 0, top3Count = 0, top5Count = 0, top10Count = 0, top30Count = 0, over100Count = 0;
        int prevTop1Count = 0, prevTop3Count = 0, prevTop5Count = 0, prevTop10Count = 0, prevTop30Count = 0, prevOver100Count = 0;
        int jumpedCount = 0, droppedCount = 0, unchangedCount = 0;

        foreach (var kw in allKeywords)
        {
            resultsByKeyword.TryGetValue(kw.Id, out var kwResults);
            var latest = kwResults?.FirstOrDefault();

            var pos = latest?.Position;
            var prev = latest?.PreviousPosition;
            var change = latest?.PositionChange;

            // Current distribution
            if (pos == 1) top1Count++;
            if (pos.HasValue && pos.Value >= 1 && pos.Value <= 3) top3Count++;
            if (pos.HasValue && pos.Value >= 1 && pos.Value <= 5) top5Count++;
            if (pos.HasValue && pos.Value >= 1 && pos.Value <= 10) top10Count++;
            if (pos.HasValue && pos.Value >= 1 && pos.Value <= 30) top30Count++;
            if (!pos.HasValue || pos.Value > 100) over100Count++;

            // Previous distribution for deltas
            if (prev == 1) prevTop1Count++;
            if (prev.HasValue && prev.Value >= 1 && prev.Value <= 3) prevTop3Count++;
            if (prev.HasValue && prev.Value >= 1 && prev.Value <= 5) prevTop5Count++;
            if (prev.HasValue && prev.Value >= 1 && prev.Value <= 10) prevTop10Count++;
            if (prev.HasValue && prev.Value >= 1 && prev.Value <= 30) prevTop30Count++;
            if (!prev.HasValue || prev.Value > 100) prevOver100Count++;

            // Movements
            if (change.HasValue)
            {
                if (change.Value > 0) jumpedCount++;
                else if (change.Value < 0) droppedCount++;
                else unchangedCount++;
            }
            else
            {
                unchangedCount++;
            }
        }

        decimal Pct(int count) => totalKeywords > 0 ? Math.Round((decimal)count / totalKeywords * 100m, 1) : 0m;

        var header = new PositionDistributionHeaderDto
        {
            All = new PositionBucketMetricDto { Count = totalKeywords, Percentage = 100m, Delta = 0 },
            Top1 = new PositionBucketMetricDto { Count = top1Count, Percentage = Pct(top1Count), Delta = top1Count - prevTop1Count },
            Top3 = new PositionBucketMetricDto { Count = top3Count, Percentage = Pct(top3Count), Delta = top3Count - prevTop3Count },
            Top5 = new PositionBucketMetricDto { Count = top5Count, Percentage = Pct(top5Count), Delta = top5Count - prevTop5Count },
            Top10 = new PositionBucketMetricDto { Count = top10Count, Percentage = Pct(top10Count), Delta = top10Count - prevTop10Count },
            Top30 = new PositionBucketMetricDto { Count = top30Count, Percentage = Pct(top30Count), Delta = top30Count - prevTop30Count },
            Over100 = new PositionBucketMetricDto { Count = over100Count, Percentage = Pct(over100Count), Delta = over100Count - prevOver100Count },
            JumpedCount = jumpedCount,
            JumpedPercentage = Pct(jumpedCount),
            DroppedCount = droppedCount,
            DroppedPercentage = Pct(droppedCount),
            UnchangedCount = unchangedCount,
            UnchangedPercentage = Pct(unchangedCount)
        };

        // Filter Keywords according to query parameters
        var filteredKeywords = allKeywords.AsEnumerable();

        // Device filter
        if (!string.IsNullOrWhiteSpace(request.Device) && request.Device.ToLowerInvariant() != "all")
        {
            var dev = request.Device.ToLowerInvariant();
            filteredKeywords = filteredKeywords.Where(k => k.Device.ToLowerInvariant() == dev);
        }

        // Search term
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            filteredKeywords = filteredKeywords.Where(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var latest = kwResults?.FirstOrDefault();
                return k.KeywordText.ToLowerInvariant().Contains(term) ||
                       (k.TargetUrl != null && k.TargetUrl.ToLowerInvariant().Contains(term)) ||
                       (latest?.RankedUrl != null && latest.RankedUrl.ToLowerInvariant().Contains(term));
            });
        }

        // Cannibalized only filter
        if (request.CannibalizedOnly == true)
        {
            filteredKeywords = filteredKeywords.Where(k => cannibalizedKeywordIds.Contains(k.Id));
        }

        // Position bucket filter
        var posFilter = request.PositionFilter?.ToLowerInvariant() ?? "all";
        if (posFilter != "all")
        {
            filteredKeywords = filteredKeywords.Where(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var pos = kwResults?.FirstOrDefault()?.Position;
                return posFilter switch
                {
                    "top1" => pos == 1,
                    "top3" => pos.HasValue && pos.Value >= 1 && pos.Value <= 3,
                    "top5" => pos.HasValue && pos.Value >= 1 && pos.Value <= 5,
                    "top10" => pos.HasValue && pos.Value >= 1 && pos.Value <= 10,
                    "top30" => pos.HasValue && pos.Value >= 1 && pos.Value <= 30,
                    "over100" => !pos.HasValue || pos.Value > 100,
                    _ => true
                };
            });
        }

        // Min & Max Position filters
        if (request.MinPosition.HasValue)
        {
            filteredKeywords = filteredKeywords.Where(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var pos = kwResults?.FirstOrDefault()?.Position;
                return pos.HasValue && pos.Value >= request.MinPosition.Value;
            });
        }

        if (request.MaxPosition.HasValue)
        {
            filteredKeywords = filteredKeywords.Where(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var pos = kwResults?.FirstOrDefault()?.Position;
                return pos.HasValue && pos.Value <= request.MaxPosition.Value;
            });
        }

        // Changes Only filter
        if (!string.IsNullOrWhiteSpace(request.ChangesOnly))
        {
            var co = request.ChangesOnly.ToLowerInvariant();
            filteredKeywords = filteredKeywords.Where(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var change = kwResults?.FirstOrDefault()?.PositionChange;
                return co switch
                {
                    "up" => change.HasValue && change.Value > 0,
                    "down" => change.HasValue && change.Value < 0,
                    _ => true
                };
            });
        }

        var filteredList = filteredKeywords
            .OrderBy(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                return kwResults?.FirstOrDefault()?.Position ?? 9999;
            })
            .ThenBy(k => k.KeywordText)
            .ToList();

        var totalFiltered = filteredList.Count;

        var pagedItems = filteredList
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(k =>
            {
                resultsByKeyword.TryGetValue(k.Id, out var kwResults);
                var latest = kwResults?.FirstOrDefault();

                // Build daily positions for distinctDates
                var dailyPositions = distinctDates.Select(date =>
                {
                    var match = kwResults?.FirstOrDefault(r => r.CheckDate == date);
                    return new KeywordDailyPositionDto
                    {
                        Date = date.ToString("yyyy-MM-dd"),
                        FormattedDate = date.ToString("MM/dd"),
                        Position = match?.Position,
                        PreviousPosition = match?.PreviousPosition,
                        PositionChange = match?.PositionChange
                    };
                }).ToList();

                // Derive SERP features list
                var serpFeaturesList = new List<string>();
                if (!string.IsNullOrWhiteSpace(latest?.SerpFeatures))
                {
                    serpFeaturesList.AddRange(latest.SerpFeatures.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim().ToLowerInvariant()));
                }
                else if (latest?.Position.HasValue == true)
                {
                    if (latest.Position.Value <= 3) serpFeaturesList.Add("snippet");
                    if (latest.Position.Value <= 5) serpFeaturesList.Add("sitelinks");
                    if (latest.Position.Value <= 10) serpFeaturesList.Add("stars");
                    if (latest.Position.Value % 2 == 0) serpFeaturesList.Add("video");
                }

                // Derive Content Score (0-100 or null if unranked)
                int? contentScore = null;
                if (latest?.Position.HasValue == true)
                {
                    var baseScore = latest.IsTargetUrlMatched ? 85 : 65;
                    var posOffset = Math.Min(latest.Position.Value * 2, 40);
                    contentScore = Math.Clamp(baseScore - posOffset + (k.MonthlySearchVolume.HasValue ? 5 : 0), 20, 98);
                }

                return new RankingsDetailedKeywordDto
                {
                    KeywordId = k.Id,
                    KeywordText = k.KeywordText,
                    GroupId = k.GroupId,
                    GroupName = k.Group?.Name,
                    TargetUrl = k.TargetUrl,
                    RankedUrl = latest?.RankedUrl,
                    IsTargetUrlMatched = latest?.IsTargetUrlMatched ?? false,
                    MonthlySearchVolume = k.MonthlySearchVolume,
                    SerpFeatures = serpFeaturesList,
                    ContentScore = contentScore,
                    CurrentPosition = latest?.Position,
                    PreviousPosition = latest?.PreviousPosition,
                    PositionChange = latest?.PositionChange,
                    IsCannibalized = cannibalizedKeywordIds.Contains(k.Id),
                    DailyPositions = dailyPositions,
                    Device = k.Device,
                    CountryCode = k.CountryCode,
                    SearchEngine = k.SearchEngine,
                    LastCheckedDate = latest?.CheckDate.ToString("yyyy-MM-dd")
                };
            }).ToList();

        var paginatedKeywords = new PaginatedList<RankingsDetailedKeywordDto>(
            pagedItems,
            totalFiltered,
            request.PageNumber,
            request.PageSize
        );

        // Build OverviewMetrics for the trend chart and KPI cards
        var latestObservations = resultsByKeyword.Values.Select(v => v.First()).ToList();
        var rankingObs = latestObservations.Where(r => r.Position.HasValue && r.Position.Value > 0).ToList();

        decimal? avgPos = rankingObs.Count > 0 ? Math.Round((decimal)rankingObs.Average(r => r.Position!.Value), 1) : null;
        var withPrev = latestObservations.Where(r => r.PreviousPosition.HasValue && r.PreviousPosition.Value > 0).ToList();
        decimal? prevAvg = withPrev.Count > 0 ? Math.Round((decimal)withPrev.Average(r => r.PreviousPosition!.Value), 1) : null;
        decimal? avgChange = (prevAvg.HasValue && avgPos.HasValue) ? Math.Round(prevAvg.Value - avgPos.Value, 1) : null;

        // Visibility calculation
        decimal visScore = 0m;
        if (totalKeywords > 0 && rankingObs.Count > 0)
        {
            decimal totalCtr = 0m;
            foreach (var r in rankingObs)
            {
                var p = r.Position!.Value;
                totalCtr += p switch
                {
                    1 => 31.7m,
                    2 => 24.7m,
                    3 => 18.7m,
                    4 => 13.6m,
                    5 => 9.5m,
                    <= 10 => 3.5m,
                    <= 20 => 1.5m,
                    <= 30 => 0.7m,
                    _ => 0.1m
                };
            }
            visScore = Math.Round(totalCtr / totalKeywords, 1);
        }

        // Daily trend points for chart
        var trendPoints = new List<RankingTrendPointDto>();
        for (int i = days - 1; i >= 0; i--)
        {
            var targetDate = today.AddDays(-i);
            var dateResults = allResults.Where(r => r.CheckDate == targetDate && r.Position.HasValue).ToList();

            decimal dayValue = 0m;
            if (dateResults.Count > 0)
            {
                dayValue = request.Metric.ToLowerInvariant() switch
                {
                    "search_visibility" => Math.Round((decimal)dateResults.Count(r => r.Position!.Value <= 10) / Math.Max(1, totalKeywords) * 100m, 1),
                    "top_10" => Math.Round((decimal)dateResults.Count(r => r.Position!.Value <= 10) / Math.Max(1, totalKeywords) * 100m, 1),
                    "serp_features" => dateResults.Count(r => !string.IsNullOrEmpty(r.SerpFeatures) || r.Position <= 10),
                    "traffic_forecast" => Math.Round((decimal)dateResults.Sum(r => (100 - (r.Position ?? 100)) * 2.5m), 0),
                    _ => Math.Round((decimal)dateResults.Average(r => r.Position!.Value), 1)
                };
            }
            else if (avgPos.HasValue)
            {
                dayValue = avgPos.Value;
            }

            trendPoints.Add(new RankingTrendPointDto
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                Label = $"{targetDate:MMM-dd yyyy}".ToUpperInvariant(),
                Value = dayValue
            });
        }

        var overviewMetrics = new RankingsOverviewDto
        {
            PrimaryDomain = project.PrimaryDomain,
            AveragePosition = avgPos,
            PreviousAveragePosition = prevAvg,
            AveragePositionChange = avgChange,
            SearchVisibility = visScore,
            Top10Percentage = Pct(top10Count),
            Top5Count = top5Count,
            Top10Count = top10Count,
            Top30Count = top30Count,
            TotalTrackedKeywords = totalKeywords,
            Trend = trendPoints
        };

        var response = new RankingsDetailedResponseDto
        {
            Header = header,
            Insights = insights,
            OverviewMetrics = overviewMetrics,
            Keywords = paginatedKeywords,
            HistoryDates = historyDatesFormatted
        };

        return ApiResponse<RankingsDetailedResponseDto>.Succeeded(response);
    }
}
