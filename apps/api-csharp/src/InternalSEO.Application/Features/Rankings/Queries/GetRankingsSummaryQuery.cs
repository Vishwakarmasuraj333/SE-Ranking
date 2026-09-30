using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.Common;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetRankingsSummaryQuery(
    Guid ProjectId,
    int Days = 30
) : IRequest<ApiResponse<RankingsSummaryDto>>;

public class GetRankingsSummaryQueryHandler : IRequestHandler<GetRankingsSummaryQuery, ApiResponse<RankingsSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRankingsSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<RankingsSummaryDto>> Handle(GetRankingsSummaryQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        var totalKeywordsCount = await _context.Keywords
            .AsNoTracking()
            .Where(k => k.ProjectId == request.ProjectId)
            .CountAsync(cancellationToken);

        int days = request.Days > 0 ? request.Days : 30;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-days);

        // Fetch rank results for the primary project within the historical window
        var allResults = await _context.RankResults
            .AsNoTracking()
            .Include(r => r.Keyword)
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        // Fetch competitors and their latest rankings
        var competitors = await _context.Competitors
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        var competitorResults = await _context.CompetitorRankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        var responseDto = new RankingsSummaryDto
        {
            ProjectId = project.Id,
            PrimaryDomain = project.PrimaryDomain,
            TotalKeywordsTracked = totalKeywordsCount,
            AlgorithmNotes = GetDefaultAlgorithmNotes()
        };

        if (allResults.Count == 0)
        {
            // If no rank results exist yet, return graceful empty state with competitors list
            responseDto.Competitors = competitors.Select(c => new RankingsCompetitorSnapshotDto
            {
                CompetitorId = c.Id,
                Name = c.Name,
                Domain = c.Domain,
                SearchVisibility = 0m,
                AveragePosition = null,
                RankedCount = 0
            }).ToList();

            return ApiResponse<RankingsSummaryDto>.Succeeded(responseDto, "No ranking data available for this timeframe.");
        }

        // Determine latest recorded check date and staleness (>48h)
        var latestCheckDate = allResults.Max(r => r.CheckDate);
        var latestRecordedAt = allResults.Max(r => r.RecordedAt);
        responseDto.LastCheckedAt = latestRecordedAt;
        responseDto.IsStale = latestCheckDate < today.AddDays(-2);

        // Group observations by keyword to get latest and previous positions
        var keywordGroups = allResults
            .GroupBy(r => r.KeywordId)
            .ToList();

        var latestByKeyword = keywordGroups
            .Select(g => g.OrderByDescending(r => r.CheckDate).First())
            .ToList();

        var rankedKeywords = latestByKeyword
            .Where(r => r.Position.HasValue && r.Position.Value > 0 && r.Position.Value <= 100)
            .ToList();

        responseDto.TotalKeywordsInSerp = rankedKeywords.Count;

        // Current Visibility & Average Position
        var latestPositions = latestByKeyword.Select(r => r.Position).ToList();
        responseDto.SearchVisibility = SearchVisibilityCalculator.CalculateScore(latestPositions, totalKeywordsCount);

        responseDto.AveragePosition = rankedKeywords.Count > 0
            ? Math.Round((decimal)rankedKeywords.Average(r => r.Position!.Value), 1)
            : null;

        // Previous Visibility & Average Position (from previous check date or PreviousPosition field)
        var previousPositions = new List<int?>();
        var previousRankedPositions = new List<int>();

        foreach (var group in keywordGroups)
        {
            var ordered = group.OrderByDescending(r => r.CheckDate).ToList();
            if (ordered.Count > 1 && ordered[1].Position.HasValue)
            {
                var prevPos = ordered[1].Position;
                previousPositions.Add(prevPos);
                if (prevPos.HasValue && prevPos.Value > 0 && prevPos.Value <= 100)
                {
                    previousRankedPositions.Add(prevPos.Value);
                }
            }
            else if (ordered[0].PreviousPosition.HasValue)
            {
                var prevPos = ordered[0].PreviousPosition;
                previousPositions.Add(prevPos);
                if (prevPos.HasValue && prevPos.Value > 0 && prevPos.Value <= 100)
                {
                    previousRankedPositions.Add(prevPos.Value);
                }
            }
            else
            {
                previousPositions.Add(null);
            }
        }

        var previousVisibility = SearchVisibilityCalculator.CalculateScore(previousPositions, totalKeywordsCount);
        responseDto.SearchVisibilityChange = Math.Round(responseDto.SearchVisibility - previousVisibility, 1);

        if (previousRankedPositions.Count > 0 && responseDto.AveragePosition.HasValue)
        {
            var prevAvg = (decimal)previousRankedPositions.Average();
            // In ranking, previous - current is positive when ranking improved (e.g. 15.0 -> 12.0 = +3.0)
            responseDto.AveragePositionChange = Math.Round(prevAvg - responseDto.AveragePosition.Value, 1);
        }

        // 1. Position Distribution Buckets (Top 1, Top 2-3, Top 4-5, Top 6-10, Top 11-30, Top 31-100, >100)
        var dist = new PositionDistributionBucketsDto
        {
            Top1 = latestByKeyword.Count(r => r.Position == 1),
            Top2_3 = latestByKeyword.Count(r => r.Position >= 2 && r.Position <= 3),
            Top4_5 = latestByKeyword.Count(r => r.Position >= 4 && r.Position <= 5),
            Top6_10 = latestByKeyword.Count(r => r.Position >= 6 && r.Position <= 10),
            Top11_30 = latestByKeyword.Count(r => r.Position >= 11 && r.Position <= 30),
            Top31_100 = latestByKeyword.Count(r => r.Position >= 31 && r.Position <= 100),
        };
        dist.GreaterThan100 = Math.Max(0, totalKeywordsCount - (dist.Top1 + dist.Top2_3 + dist.Top4_5 + dist.Top6_10 + dist.Top11_30 + dist.Top31_100));
        responseDto.Distribution = dist;

        // Position Distribution Trend
        var dateGroups = allResults
            .GroupBy(r => r.CheckDate)
            .OrderBy(g => g.Key)
            .ToList();

        foreach (var dg in dateGroups)
        {
            var dayResults = dg.GroupBy(r => r.KeywordId).Select(g => g.First()).ToList();
            var dayTop1 = dayResults.Count(r => r.Position == 1);
            var dayTop2_3 = dayResults.Count(r => r.Position >= 2 && r.Position <= 3);
            var dayTop4_5 = dayResults.Count(r => r.Position >= 4 && r.Position <= 5);
            var dayTop6_10 = dayResults.Count(r => r.Position >= 6 && r.Position <= 10);
            var dayTop11_30 = dayResults.Count(r => r.Position >= 11 && r.Position <= 30);
            var dayTop31_100 = dayResults.Count(r => r.Position >= 31 && r.Position <= 100);
            var dayGreater100 = Math.Max(0, totalKeywordsCount - (dayTop1 + dayTop2_3 + dayTop4_5 + dayTop6_10 + dayTop11_30 + dayTop31_100));

            responseDto.DistributionTrend.Add(new PositionDistributionTrendPointDto
            {
                Date = dg.Key.ToString("yyyy-MM-dd"),
                Top1 = dayTop1,
                Top2_3 = dayTop2_3,
                Top4_5 = dayTop4_5,
                Top6_10 = dayTop6_10,
                Top11_30 = dayTop11_30,
                Top31_100 = dayTop31_100,
                GreaterThan100 = dayGreater100
            });
        }

        // 2. SERP Movement Summary (Jumped, Dropped, Unchanged)
        int jumpedCount = 0;
        int droppedCount = 0;
        int unchangedCount = 0;
        var jumpedBreakdown = new SerpMovementBucketBreakdownDto();
        var droppedBreakdown = new SerpMovementBucketBreakdownDto();
        var unchangedBreakdown = new SerpMovementBucketBreakdownDto();

        foreach (var r in latestByKeyword)
        {
            int change = r.PositionChange ?? 0;
            int? pos = r.Position;

            if (change > 0)
            {
                jumpedCount++;
                if (pos.HasValue)
                {
                    if (pos.Value <= 3) jumpedBreakdown.Top1_3++;
                    else if (pos.Value <= 10) jumpedBreakdown.Top4_10++;
                    else if (pos.Value <= 30) jumpedBreakdown.Top11_30++;
                    else if (pos.Value <= 100) jumpedBreakdown.Top31_100++;
                }
            }
            else if (change < 0)
            {
                droppedCount++;
                if (pos.HasValue)
                {
                    if (pos.Value <= 3) droppedBreakdown.Top1_3++;
                    else if (pos.Value <= 10) droppedBreakdown.Top4_10++;
                    else if (pos.Value <= 30) droppedBreakdown.Top11_30++;
                    else if (pos.Value <= 100) droppedBreakdown.Top31_100++;
                }
            }
            else
            {
                unchangedCount++;
                if (pos.HasValue)
                {
                    if (pos.Value <= 3) unchangedBreakdown.Top1_3++;
                    else if (pos.Value <= 10) unchangedBreakdown.Top4_10++;
                    else if (pos.Value <= 30) unchangedBreakdown.Top11_30++;
                    else if (pos.Value <= 100) unchangedBreakdown.Top31_100++;
                }
            }
        }

        int totalEvaluated = Math.Max(1, latestByKeyword.Count);
        responseDto.Movement = new SerpMovementSummaryDto
        {
            JumpedCount = jumpedCount,
            JumpedPercentage = Math.Round(((decimal)jumpedCount / totalEvaluated) * 100m, 1),
            DroppedCount = droppedCount,
            DroppedPercentage = Math.Round(((decimal)droppedCount / totalEvaluated) * 100m, 1),
            UnchangedCount = unchangedCount,
            UnchangedPercentage = Math.Round(((decimal)unchangedCount / totalEvaluated) * 100m, 1),
            JumpedByBucket = jumpedBreakdown,
            DroppedByBucket = droppedBreakdown,
            UnchangedByBucket = unchangedBreakdown
        };

        // 3. Top / Jumped / Dropped Keywords Preview (Top 5 each)
        responseDto.TopKeywords = latestByKeyword
            .Where(r => r.Position.HasValue && r.Position.Value > 0)
            .OrderBy(r => r.Position!.Value)
            .ThenByDescending(r => r.Keyword?.MonthlySearchVolume ?? 0)
            .Take(5)
            .Select(r => new RankingsKeywordPreviewDto
            {
                KeywordId = r.KeywordId,
                KeywordText = r.Keyword?.KeywordText ?? string.Empty,
                Position = r.Position,
                PreviousPosition = r.PreviousPosition,
                PositionChange = r.PositionChange,
                SearchVolume = r.Keyword?.MonthlySearchVolume,
                RankedUrl = r.RankedUrl,
                SerpFeatures = r.SerpFeatures
            })
            .ToList();

        responseDto.JumpedKeywords = latestByKeyword
            .Where(r => (r.PositionChange ?? 0) > 0)
            .OrderByDescending(r => r.PositionChange ?? 0)
            .Take(5)
            .Select(r => new RankingsKeywordPreviewDto
            {
                KeywordId = r.KeywordId,
                KeywordText = r.Keyword?.KeywordText ?? string.Empty,
                Position = r.Position,
                PreviousPosition = r.PreviousPosition,
                PositionChange = r.PositionChange,
                SearchVolume = r.Keyword?.MonthlySearchVolume,
                RankedUrl = r.RankedUrl,
                SerpFeatures = r.SerpFeatures
            })
            .ToList();

        responseDto.DroppedKeywords = latestByKeyword
            .Where(r => (r.PositionChange ?? 0) < 0)
            .OrderBy(r => r.PositionChange ?? 0)
            .Take(5)
            .Select(r => new RankingsKeywordPreviewDto
            {
                KeywordId = r.KeywordId,
                KeywordText = r.Keyword?.KeywordText ?? string.Empty,
                Position = r.Position,
                PreviousPosition = r.PreviousPosition,
                PositionChange = r.PositionChange,
                SearchVolume = r.Keyword?.MonthlySearchVolume,
                RankedUrl = r.RankedUrl,
                SerpFeatures = r.SerpFeatures
            })
            .ToList();

        // 4. Pages Overview (top ranked URLs grouped)
        responseDto.TopPages = latestByKeyword
            .Where(r => !string.IsNullOrWhiteSpace(r.RankedUrl) && r.Position.HasValue)
            .GroupBy(r => r.RankedUrl!)
            .Select(g => new RankingsPageSummaryDto
            {
                Url = g.Key,
                TotalKeywords = g.Count(),
                AveragePosition = Math.Round((decimal)g.Average(r => r.Position!.Value), 1),
                Top10Count = g.Count(r => r.Position!.Value <= 10),
                BestPosition = g.Min(r => r.Position!.Value)
            })
            .OrderByDescending(p => p.TotalKeywords)
            .ThenBy(p => p.AveragePosition)
            .Take(10)
            .ToList();

        // 5. Competitors Snapshot
        var compGroups = competitorResults.GroupBy(r => r.CompetitorId).ToDictionary(g => g.Key, g => g.ToList());
        foreach (var comp in competitors)
        {
            if (compGroups.TryGetValue(comp.Id, out var cResults))
            {
                var compLatest = cResults
                    .GroupBy(r => r.KeywordId)
                    .Select(g => g.OrderByDescending(r => r.CheckDate).First())
                    .ToList();

                var compPositions = compLatest.Select(r => r.Position).ToList();
                var compRanked = compLatest.Where(r => r.Position.HasValue && r.Position.Value > 0 && r.Position.Value <= 100).ToList();

                responseDto.Competitors.Add(new RankingsCompetitorSnapshotDto
                {
                    CompetitorId = comp.Id,
                    Name = comp.Name,
                    Domain = comp.Domain,
                    SearchVisibility = SearchVisibilityCalculator.CalculateScore(compPositions, totalKeywordsCount),
                    AveragePosition = compRanked.Count > 0 ? Math.Round((decimal)compRanked.Average(r => r.Position!.Value), 1) : null,
                    RankedCount = compRanked.Count
                });
            }
            else
            {
                responseDto.Competitors.Add(new RankingsCompetitorSnapshotDto
                {
                    CompetitorId = comp.Id,
                    Name = comp.Name,
                    Domain = comp.Domain,
                    SearchVisibility = 0m,
                    AveragePosition = null,
                    RankedCount = 0
                });
            }
        }

        return ApiResponse<RankingsSummaryDto>.Succeeded(responseDto);
    }

    private static List<AlgorithmNoteDto> GetDefaultAlgorithmNotes()
    {
        return new List<AlgorithmNoteDto>
        {
            new()
            {
                Id = "algo-1",
                Title = "Google Core Algorithm Update",
                Date = "2026-08-15",
                Category = "Core Update",
                Severity = "warning",
                Description = "Major broad core update targeting content helpfulness and domain-level authority signals across global search."
            },
            new()
            {
                Id = "algo-2",
                Title = "Search Spam & Reputation Policy Update",
                Date = "2026-07-20",
                Category = "Spam Update",
                Severity = "notice",
                Description = "Refinements to algorithmic detection of site reputation abuse and scaled content generation."
            },
            new()
            {
                Id = "algo-3",
                Title = "Helpful Content & Review Signal Refresh",
                Date = "2026-06-05",
                Category = "Quality Signals",
                Severity = "info",
                Description = "Ongoing calibration for deep technical content and experiential page quality signals."
            }
        };
    }
}
