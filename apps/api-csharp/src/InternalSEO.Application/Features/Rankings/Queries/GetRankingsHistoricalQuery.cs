using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetRankingsHistoricalQuery(
    Guid ProjectId,
    DateOnly? DateFrom = null,
    DateOnly? DateTo = null,
    string PositionFilter = "all", // all, top1, top3, top5, top10, top30, over100
    int? MinPosition = null,
    int? MaxPosition = null,
    string? ChangesOnly = null, // up, down
    string? Search = null,
    string? Device = null,
    int PageNumber = 1,
    int PageSize = 100
) : IRequest<ApiResponse<RankingsHistoricalResponseDto>>;

public class GetRankingsHistoricalQueryHandler : IRequestHandler<GetRankingsHistoricalQuery, ApiResponse<RankingsHistoricalResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRankingsHistoricalQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<RankingsHistoricalResponseDto>> Handle(GetRankingsHistoricalQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        var allKeywords = await _context.Keywords
            .AsNoTracking()
            .Include(k => k.Group)
            .Where(k => k.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        var allResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        var availableDates = allResults
            .Select(r => r.CheckDate)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Date Resolution: DateTo (Current) and DateFrom (Baseline)
        var dateTo = request.DateTo ?? (availableDates.Count > 0 ? availableDates[0] : today);
        var dateFrom = request.DateFrom ?? (availableDates.Count > 1 ? availableDates[1] : (availableDates.Count > 0 ? availableDates[0].AddDays(-30) : today.AddDays(-30)));

        if (dateFrom > dateTo)
        {
            (dateFrom, dateTo) = (dateTo, dateFrom);
        }

        var resultsByKeyword = allResults
            .GroupBy(r => r.KeywordId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Process keywords comparison between dateFrom (baseline) and dateTo (current)
        var totalKeywords = allKeywords.Count;
        int top1Count = 0, top3Count = 0, top5Count = 0, top10Count = 0, top30Count = 0, over100Count = 0;
        int baseTop1Count = 0, baseTop3Count = 0, baseTop5Count = 0, baseTop10Count = 0, baseTop30Count = 0, baseOver100Count = 0;
        int jumpedCount = 0, droppedCount = 0, unchangedCount = 0;

        var keywordComparisons = new List<(Domain.Entities.Keyword Keyword, int? BasePos, int? CurPos, int Change, Domain.Entities.RankResult? CurResult)>();

        foreach (var kw in allKeywords)
        {
            resultsByKeyword.TryGetValue(kw.Id, out var kwResults);

            // Find current observation on or closest <= dateTo
            var curResult = kwResults?
                .Where(r => r.CheckDate <= dateTo)
                .OrderByDescending(r => r.CheckDate)
                .FirstOrDefault();

            // Find baseline observation on or closest <= dateFrom
            var baseResult = kwResults?
                .Where(r => r.CheckDate <= dateFrom)
                .OrderByDescending(r => r.CheckDate)
                .FirstOrDefault();

            var curPos = curResult?.Position;
            var basePos = baseResult?.Position;

            int change = 0;
            if (curPos.HasValue && basePos.HasValue)
            {
                // In rankings lower is better: base - cur > 0 means improvement
                change = basePos.Value - curPos.Value;
            }
            else if (curPos.HasValue && !basePos.HasValue)
            {
                change = 100 - curPos.Value;
            }
            else if (!curPos.HasValue && basePos.HasValue)
            {
                change = -basePos.Value;
            }

            // Current distribution
            if (curPos == 1) top1Count++;
            if (curPos.HasValue && curPos.Value >= 1 && curPos.Value <= 3) top3Count++;
            if (curPos.HasValue && curPos.Value >= 1 && curPos.Value <= 5) top5Count++;
            if (curPos.HasValue && curPos.Value >= 1 && curPos.Value <= 10) top10Count++;
            if (curPos.HasValue && curPos.Value >= 1 && curPos.Value <= 30) top30Count++;
            if (!curPos.HasValue || curPos.Value > 100) over100Count++;

            // Baseline distribution
            if (basePos == 1) baseTop1Count++;
            if (basePos.HasValue && basePos.Value >= 1 && basePos.Value <= 3) baseTop3Count++;
            if (basePos.HasValue && basePos.Value >= 1 && basePos.Value <= 5) baseTop5Count++;
            if (basePos.HasValue && basePos.Value >= 1 && basePos.Value <= 10) baseTop10Count++;
            if (basePos.HasValue && basePos.Value >= 1 && basePos.Value <= 30) baseTop30Count++;
            if (!basePos.HasValue || basePos.Value > 100) baseOver100Count++;

            // Movement count
            if (change > 0) jumpedCount++;
            else if (change < 0) droppedCount++;
            else unchangedCount++;

            keywordComparisons.Add((kw, basePos, curPos, change, curResult));
        }

        decimal Pct(int count) => totalKeywords > 0 ? Math.Round((decimal)count / totalKeywords * 100m, 1) : 0m;

        var header = new PositionDistributionHeaderDto
        {
            All = new PositionBucketMetricDto { Count = totalKeywords, Percentage = 100m, Delta = 0 },
            Top1 = new PositionBucketMetricDto { Count = top1Count, Percentage = Pct(top1Count), Delta = top1Count - baseTop1Count },
            Top3 = new PositionBucketMetricDto { Count = top3Count, Percentage = Pct(top3Count), Delta = top3Count - baseTop3Count },
            Top5 = new PositionBucketMetricDto { Count = top5Count, Percentage = Pct(top5Count), Delta = top5Count - baseTop5Count },
            Top10 = new PositionBucketMetricDto { Count = top10Count, Percentage = Pct(top10Count), Delta = top10Count - baseTop10Count },
            Top30 = new PositionBucketMetricDto { Count = top30Count, Percentage = Pct(top30Count), Delta = top30Count - baseTop30Count },
            Over100 = new PositionBucketMetricDto { Count = over100Count, Percentage = Pct(over100Count), Delta = over100Count - baseOver100Count },
            JumpedCount = jumpedCount,
            JumpedPercentage = Pct(jumpedCount),
            DroppedCount = droppedCount,
            DroppedPercentage = Pct(droppedCount),
            UnchangedCount = unchangedCount,
            UnchangedPercentage = Pct(unchangedCount)
        };

        // Comparison Metric Cards (AveragePosition, TrafficForecast, SearchVisibility, PercentInTop10)
        var curRanking = keywordComparisons.Where(k => k.CurPos.HasValue && k.CurPos.Value > 0).Select(k => k.CurPos!.Value).ToList();
        var baseRanking = keywordComparisons.Where(k => k.BasePos.HasValue && k.BasePos.Value > 0).Select(k => k.BasePos!.Value).ToList();

        decimal curAvg = curRanking.Count > 0 ? Math.Round((decimal)curRanking.Average(), 1) : 0m;
        decimal baseAvg = baseRanking.Count > 0 ? Math.Round((decimal)baseRanking.Average(), 1) : 0m;
        decimal avgChange = baseAvg > 0 && curAvg > 0 ? Math.Round(baseAvg - curAvg, 1) : 0m;

        decimal curTraffic = curRanking.Sum(pos => Math.Max(0m, (100 - pos) * 2.5m));
        decimal baseTraffic = baseRanking.Sum(pos => Math.Max(0m, (100 - pos) * 2.5m));

        decimal CalculateVisibility(List<int> positions)
        {
            if (totalKeywords == 0 || positions.Count == 0) return 0m;
            decimal totalCtr = 0m;
            foreach (var pos in positions)
            {
                totalCtr += pos switch
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
            return Math.Round(totalCtr / totalKeywords, 1);
        }

        decimal curVis = CalculateVisibility(curRanking);
        decimal baseVis = CalculateVisibility(baseRanking);

        decimal curTop10Pct = Pct(top10Count);
        decimal baseTop10Pct = Pct(baseTop10Count);

        var metrics = new HistoricalMetricsSummaryDto
        {
            AveragePosition = new HistoricalComparisonMetricDto
            {
                BaselineValue = baseAvg,
                CurrentValue = curAvg,
                Change = avgChange,
                IsPositive = avgChange >= 0
            },
            TrafficForecast = new HistoricalComparisonMetricDto
            {
                BaselineValue = Math.Round(baseTraffic, 0),
                CurrentValue = Math.Round(curTraffic, 0),
                Change = Math.Round(curTraffic - baseTraffic, 0),
                IsPositive = curTraffic >= baseTraffic
            },
            SearchVisibility = new HistoricalComparisonMetricDto
            {
                BaselineValue = baseVis,
                CurrentValue = curVis,
                Change = Math.Round(curVis - baseVis, 1),
                IsPositive = curVis >= baseVis
            },
            PercentInTop10 = new HistoricalComparisonMetricDto
            {
                BaselineValue = baseTop10Pct,
                CurrentValue = curTop10Pct,
                Change = Math.Round(curTop10Pct - baseTop10Pct, 1),
                IsPositive = curTop10Pct >= baseTop10Pct
            }
        };

        // Trajectory Points between dateFrom and dateTo
        var trajectoryDates = availableDates
            .Where(d => d >= dateFrom && d <= dateTo)
            .OrderBy(d => d)
            .ToList();

        if (trajectoryDates.Count == 0)
        {
            trajectoryDates.Add(dateFrom);
            trajectoryDates.Add(dateTo);
        }
        else if (trajectoryDates.Count == 1)
        {
            trajectoryDates.Insert(0, dateFrom);
        }

        var trajectory = trajectoryDates.Select(date =>
        {
            var obsAtDate = allResults.Where(r => r.CheckDate == date && r.Position.HasValue).ToList();
            decimal? posAvg = obsAtDate.Count > 0 ? Math.Round((decimal)obsAtDate.Average(r => r.Position!.Value), 1) : null;
            decimal tf = obsAtDate.Sum(r => Math.Max(0m, (100 - r.Position!.Value) * 2.5m));
            var positions = obsAtDate.Select(r => r.Position!.Value).ToList();
            decimal vis = CalculateVisibility(positions);
            decimal top10 = totalKeywords > 0 ? Math.Round((decimal)obsAtDate.Count(r => r.Position!.Value <= 10) / totalKeywords * 100m, 1) : 0m;

            return new HistoricalTrajectoryPointDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                FormattedDate = $"{date:MMM-dd yyyy}".ToUpperInvariant(),
                AveragePosition = posAvg,
                TrafficForecast = Math.Round(tf, 0),
                SearchVisibility = vis,
                PercentInTop10 = top10
            };
        }).ToList();

        // Keyword Filtering
        var filtered = keywordComparisons.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Device) && request.Device.ToLowerInvariant() != "all")
        {
            var dev = request.Device.ToLowerInvariant();
            filtered = filtered.Where(k => k.Keyword.Device.ToLowerInvariant() == dev);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            filtered = filtered.Where(k =>
                k.Keyword.KeywordText.ToLowerInvariant().Contains(term) ||
                (k.Keyword.TargetUrl != null && k.Keyword.TargetUrl.ToLowerInvariant().Contains(term)) ||
                (k.CurResult?.RankedUrl != null && k.CurResult.RankedUrl.ToLowerInvariant().Contains(term)));
        }

        var posFilter = request.PositionFilter?.ToLowerInvariant() ?? "all";
        if (posFilter != "all")
        {
            filtered = filtered.Where(k =>
            {
                var p = k.CurPos;
                return posFilter switch
                {
                    "top1" => p == 1,
                    "top3" => p.HasValue && p.Value >= 1 && p.Value <= 3,
                    "top5" => p.HasValue && p.Value >= 1 && p.Value <= 5,
                    "top10" => p.HasValue && p.Value >= 1 && p.Value <= 10,
                    "top30" => p.HasValue && p.Value >= 1 && p.Value <= 30,
                    "over100" => !p.HasValue || p.Value > 100,
                    _ => true
                };
            });
        }

        if (request.MinPosition.HasValue)
        {
            filtered = filtered.Where(k => k.CurPos.HasValue && k.CurPos.Value >= request.MinPosition.Value);
        }

        if (request.MaxPosition.HasValue)
        {
            filtered = filtered.Where(k => k.CurPos.HasValue && k.CurPos.Value <= request.MaxPosition.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.ChangesOnly))
        {
            var co = request.ChangesOnly.ToLowerInvariant();
            filtered = filtered.Where(k => co switch
            {
                "up" => k.Change > 0,
                "down" => k.Change < 0,
                _ => true
            });
        }

        var filteredList = filtered
            .OrderBy(k => k.CurPos ?? 9999)
            .ThenBy(k => k.Keyword.KeywordText)
            .ToList();

        var totalFiltered = filteredList.Count;

        var pagedKeywords = filteredList
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(k =>
            {
                var serpFeaturesList = new List<string>();
                if (!string.IsNullOrWhiteSpace(k.CurResult?.SerpFeatures))
                {
                    serpFeaturesList.AddRange(k.CurResult.SerpFeatures.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim().ToLowerInvariant()));
                }
                else if (k.CurPos.HasValue)
                {
                    if (k.CurPos.Value <= 3) serpFeaturesList.Add("snippet");
                    if (k.CurPos.Value <= 5) serpFeaturesList.Add("sitelinks");
                    if (k.CurPos.Value <= 10) serpFeaturesList.Add("stars");
                    if (k.CurPos.Value % 2 == 0) serpFeaturesList.Add("video");
                }

                int? contentScore = null;
                if (k.CurPos.HasValue)
                {
                    var isMatched = k.CurResult?.IsTargetUrlMatched ?? false;
                    var baseSc = isMatched ? 85 : 65;
                    contentScore = Math.Clamp(baseSc - Math.Min(k.CurPos.Value * 2, 40), 20, 98);
                }

                return new RankingsHistoricalKeywordDto
                {
                    KeywordId = k.Keyword.Id,
                    KeywordText = k.Keyword.KeywordText,
                    GroupId = k.Keyword.GroupId,
                    GroupName = k.Keyword.Group?.Name,
                    TargetUrl = k.Keyword.TargetUrl,
                    RankedUrl = k.CurResult?.RankedUrl,
                    MonthlySearchVolume = k.Keyword.MonthlySearchVolume,
                    SerpFeatures = serpFeaturesList,
                    ContentScore = contentScore,
                    BaselinePosition = k.BasePos,
                    CurrentPosition = k.CurPos,
                    PositionChange = k.Change,
                    IsTargetUrlMatched = k.CurResult?.IsTargetUrlMatched ?? false,
                    Device = k.Keyword.Device,
                    CountryCode = k.Keyword.CountryCode,
                    SearchEngine = k.Keyword.SearchEngine
                };
            }).ToList();

        var paginated = new PaginatedList<RankingsHistoricalKeywordDto>(
            pagedKeywords,
            totalFiltered,
            request.PageNumber,
            request.PageSize
        );

        var response = new RankingsHistoricalResponseDto
        {
            DateFrom = dateFrom.ToString("yyyy-MM-dd"),
            DateTo = dateTo.ToString("yyyy-MM-dd"),
            AvailableDates = availableDates.Select(d => d.ToString("yyyy-MM-dd")).ToList(),
            Header = header,
            Metrics = metrics,
            Trajectory = trajectory,
            Keywords = paginated
        };

        return ApiResponse<RankingsHistoricalResponseDto>.Succeeded(response);
    }
}
