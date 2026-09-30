using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetRankingsOverviewQuery(
    Guid ProjectId,
    string TimeRange = "week",
    string Metric = "average_position"
) : IRequest<ApiResponse<RankingsOverviewDto>>;

public class GetRankingsOverviewQueryHandler : IRequestHandler<GetRankingsOverviewQuery, ApiResponse<RankingsOverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRankingsOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<RankingsOverviewDto>> Handle(GetRankingsOverviewQuery request, CancellationToken cancellationToken)
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

        int days = request.TimeRange.ToLowerInvariant() switch
        {
            "month" => 30,
            "3months" => 90,
            "6months" => 180,
            _ => 7
        };

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-days);

        // Fetch all rank results for this project within the historical window
        var allResults = await _context.RankResults
            .AsNoTracking()
            .Include(r => r.Keyword)
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .OrderByDescending(r => r.CheckDate)
            .ToListAsync(cancellationToken);

        if (allResults.Count == 0 && totalKeywordsCount == 0)
        {
            return ApiResponse<RankingsOverviewDto>.Succeeded(new RankingsOverviewDto
            {
                PrimaryDomain = project.PrimaryDomain,
                TotalTrackedKeywords = 0,
                IsStale = false
            }, "No ranking data available for this project.");
        }

        // Get latest observation for each keyword
        var latestByKeyword = allResults
            .GroupBy(r => r.KeywordId)
            .Select(g => g.OrderByDescending(r => r.CheckDate).First())
            .ToList();

        var rankingKeywords = latestByKeyword
            .Where(r => r.Position.HasValue && r.Position.Value > 0)
            .ToList();

        int top5Count = rankingKeywords.Count(r => r.Position!.Value <= 5);
        int top10Count = rankingKeywords.Count(r => r.Position!.Value <= 10);
        int top30Count = rankingKeywords.Count(r => r.Position!.Value <= 30);

        decimal? averagePosition = rankingKeywords.Count > 0
            ? Math.Round((decimal)rankingKeywords.Average(r => r.Position!.Value), 1)
            : null;

        decimal? top10Percentage = totalKeywordsCount > 0
            ? Math.Round(((decimal)top10Count / totalKeywordsCount) * 100m, 1)
            : null;

        // Calculate visibility score: CTR estimate based on position
        decimal visibilityScore = 0m;
        if (totalKeywordsCount > 0 && rankingKeywords.Count > 0)
        {
            decimal totalCtr = 0m;
            foreach (var r in rankingKeywords)
            {
                var pos = r.Position!.Value;
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
            visibilityScore = Math.Round(totalCtr / totalKeywordsCount, 1);
        }

        // Calculate previous average position from previous positions
        var keywordsWithPrev = latestByKeyword
            .Where(r => r.PreviousPosition.HasValue && r.PreviousPosition.Value > 0)
            .ToList();

        decimal? previousAvg = keywordsWithPrev.Count > 0
            ? Math.Round((decimal)keywordsWithPrev.Average(r => r.PreviousPosition!.Value), 1)
            : null;

        // In rankings, lower position is better, so previous - current is positive when improved
        decimal? avgChange = (previousAvg.HasValue && averagePosition.HasValue)
            ? Math.Round(previousAvg.Value - averagePosition.Value, 1)
            : null;

        var lastObservation = allResults.OrderByDescending(r => r.RecordedAt).FirstOrDefault();
        var lastUpdated = lastObservation?.RecordedAt;
        bool isStale = lastUpdated.HasValue && (DateTimeOffset.UtcNow - lastUpdated.Value).TotalHours > 48;

        // Build top 5 keywords breakdown
        var top5Keywords = rankingKeywords
            .Where(r => r.Position!.Value <= 5)
            .OrderBy(r => r.Position!.Value)
            .Take(5)
            .Select(r => new KeywordRankSummaryDto
            {
                Keyword = r.Keyword?.KeywordText ?? "Unknown Keyword",
                Position = r.Position!.Value,
                Change = r.PositionChange ?? 0
            })
            .ToList();

        // Build daily trend points
        var trendPoints = new List<RankingTrendPointDto>();
        for (int i = days - 1; i >= 0; i--)
        {
            var targetDate = today.AddDays(-i);
            var dateResults = allResults.Where(r => r.CheckDate == targetDate && r.Position.HasValue).ToList();

            decimal dayValue = 0;
            if (dateResults.Count > 0)
            {
                dayValue = request.Metric.ToLowerInvariant() switch
                {
                    "search_visibility" => Math.Round((decimal)dateResults.Count(r => r.Position!.Value <= 10) / Math.Max(1, totalKeywordsCount) * 100m, 1),
                    "top_10" => Math.Round((decimal)dateResults.Count(r => r.Position!.Value <= 10) / Math.Max(1, totalKeywordsCount) * 100m, 1),
                    _ => Math.Round((decimal)dateResults.Average(r => r.Position!.Value), 1)
                };
            }
            else if (averagePosition.HasValue)
            {
                dayValue = averagePosition.Value;
            }

            var dt = targetDate.ToDateTime(TimeOnly.MinValue);
            var label = $"{dt:MMM-dd yyyy}".ToUpperInvariant();

            trendPoints.Add(new RankingTrendPointDto
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                Label = label,
                Value = dayValue
            });
        }

        var dto = new RankingsOverviewDto
        {
            AveragePosition = averagePosition,
            PreviousAveragePosition = previousAvg,
            AveragePositionChange = avgChange,
            SearchVisibility = visibilityScore,
            Top10Percentage = top10Percentage,
            Top5Count = top5Count,
            Top10Count = top10Count,
            Top30Count = top30Count,
            TotalTrackedKeywords = totalKeywordsCount,
            LastUpdated = lastUpdated,
            IsStale = isStale,
            PrimaryDomain = project.PrimaryDomain,
            Trend = trendPoints,
            Top5Keywords = top5Keywords
        };

        return ApiResponse<RankingsOverviewDto>.Succeeded(dto);
    }
}
