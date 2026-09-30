using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.Common;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Queries;

public record GetCompetitorOverviewQuery(Guid ProjectId, int Days = 30) : IRequest<ApiResponse<CompetitorOverviewDto>>;

public class GetCompetitorOverviewQueryHandler : IRequestHandler<GetCompetitorOverviewQuery, ApiResponse<CompetitorOverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCompetitorOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CompetitorOverviewDto>> Handle(GetCompetitorOverviewQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new NotFoundException(nameof(Project), request.ProjectId);

        var days = request.Days <= 0 ? 30 : request.Days;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-days);

        // Fetch active keywords count for project
        var totalKeywordsCount = await _context.Keywords
            .AsNoTracking()
            .CountAsync(k => k.ProjectId == request.ProjectId && k.IsActive, cancellationToken);

        // Fetch competitors
        var competitors = await _context.Competitors
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        // Determine last check timestamp for project (from target RankResults or CompetitorRankResults)
        var latestTargetCheck = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.RecordedAt)
            .Select(r => (DateTimeOffset?)r.RecordedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var latestCompCheck = await _context.CompetitorRankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.RecordedAt)
            .Select(r => (DateTimeOffset?)r.RecordedAt)
            .FirstOrDefaultAsync(cancellationToken);

        DateTimeOffset? lastCheckedAt = null;
        if (latestTargetCheck.HasValue && latestCompCheck.HasValue)
            lastCheckedAt = latestTargetCheck.Value > latestCompCheck.Value ? latestTargetCheck.Value : latestCompCheck.Value;
        else
            lastCheckedAt = latestTargetCheck ?? latestCompCheck;

        var isStale = !lastCheckedAt.HasValue || (DateTimeOffset.UtcNow - lastCheckedAt.Value).TotalHours > 48;

        var overview = new CompetitorOverviewDto
        {
            ProjectId = project.Id,
            TargetDomain = project.PrimaryDomain,
            TotalKeywordsCount = totalKeywordsCount,
            LastCheckedAt = lastCheckedAt,
            IsStale = isStale,
            Summaries = new List<CompetitorVisibilitySummaryDto>()
        };

        // 1. Calculate Target Domain Summary
        var targetResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .ToListAsync(cancellationToken);

        var (targetSummary, targetTop20KeywordIds) = BuildTargetSummary(project.PrimaryDomain, targetResults, totalKeywordsCount, startDate, today);
        overview.Summaries.Add(targetSummary);

        // 2. Calculate Summary per Competitor
        var compResults = await _context.CompetitorRankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.CheckDate >= startDate)
            .ToListAsync(cancellationToken);

        foreach (var comp in competitors)
        {
            var resultsForComp = compResults.Where(r => r.CompetitorId == comp.Id).ToList();
            overview.Summaries.Add(BuildCompetitorSummary(comp, resultsForComp, totalKeywordsCount, startDate, today, targetTop20KeywordIds));
        }

        DateOnly? latestTargetDate = targetResults.Count > 0 ? targetResults.Max(r => (DateOnly?)r.CheckDate) : null;
        DateOnly? latestCompDate = compResults.Count > 0 ? compResults.Max(r => (DateOnly?)r.CheckDate) : null;
        DateOnly? latestCheckDate = null;
        if (latestTargetDate.HasValue && latestCompDate.HasValue)
            latestCheckDate = latestTargetDate > latestCompDate ? latestTargetDate : latestCompDate;
        else
            latestCheckDate = latestTargetDate ?? latestCompDate;
        overview.LatestCheckDate = latestCheckDate;

        return ApiResponse<CompetitorOverviewDto>.Succeeded(overview);
    }

    private static (CompetitorVisibilitySummaryDto Summary, HashSet<Guid> Top20KeywordIds) BuildTargetSummary(
        string domain,
        List<RankResult> results,
        int totalKeywords,
        DateOnly startDate,
        DateOnly endDate)
    {
        var groupedByDate = results.GroupBy(r => r.CheckDate).ToDictionary(g => g.Key, g => g.ToList());

        var latestDate = groupedByDate.Keys.OrderByDescending(k => k).FirstOrDefault();
        var latestResults = latestDate != default ? groupedByDate[latestDate] : new List<RankResult>();

        var currentPositions = latestResults.Select(r => r.Position).ToList();
        var currentVisibility = SearchVisibilityCalculator.CalculateScore(currentPositions, totalKeywords);

        var rankedPositions = latestResults.Where(r => r.Position.HasValue && r.Position.Value > 0).Select(r => r.Position!.Value).ToList();
        decimal? currentAvg = rankedPositions.Count > 0 ? Math.Round((decimal)rankedPositions.Average(), 1) : null;

        var targetTop20KeywordIds = latestResults
            .Where(r => r.Position.HasValue && r.Position.Value >= 1 && r.Position.Value <= 20)
            .Select(r => r.KeywordId)
            .ToHashSet();

        var history = new List<CompetitorVisibilityPointDto>();
        for (var d = startDate; d <= endDate; d = d.AddDays(1))
        {
            if (groupedByDate.TryGetValue(d, out var dayResults))
            {
                var dayPositions = dayResults.Select(r => r.Position).ToList();
                var dayRanked = dayResults.Where(r => r.Position.HasValue && r.Position.Value > 0).Select(r => r.Position!.Value).ToList();

                history.Add(new CompetitorVisibilityPointDto
                {
                    Date = d.ToString("yyyy-MM-dd"),
                    Visibility = SearchVisibilityCalculator.CalculateScore(dayPositions, totalKeywords),
                    AveragePosition = dayRanked.Count > 0 ? Math.Round((decimal)dayRanked.Average(), 1) : null,
                    RankedKeywordsCount = dayRanked.Count
                });
            }
        }

        var top100Count = rankedPositions.Count(p => p <= 100);
        var unrankedCount = Math.Max(0, totalKeywords - top100Count);
        var overlapCount = targetTop20KeywordIds.Count;
        var overlapPct = totalKeywords > 0 ? Math.Round((decimal)overlapCount / totalKeywords * 100m, 1) : 0m;

        var summary = new CompetitorVisibilitySummaryDto
        {
            CompetitorId = null,
            Domain = domain,
            Name = $"{domain} (Primary)",
            IsTargetDomain = true,
            CurrentVisibility = currentVisibility,
            CurrentAveragePosition = currentAvg,
            CurrentRankedCount = rankedPositions.Count,
            Top3Count = rankedPositions.Count(p => p <= 3),
            Top10Count = rankedPositions.Count(p => p <= 10),
            Top20Count = rankedPositions.Count(p => p <= 20),
            Top30Count = rankedPositions.Count(p => p <= 30),
            Top100Count = top100Count,
            UnrankedCount = unrankedCount,
            Top20OverlapCount = overlapCount,
            Top20OverlapPercentage = overlapPct,
            History = history
        };

        return (summary, targetTop20KeywordIds);
    }

    private static CompetitorVisibilitySummaryDto BuildCompetitorSummary(
        Competitor competitor,
        List<CompetitorRankResult> results,
        int totalKeywords,
        DateOnly startDate,
        DateOnly endDate,
        HashSet<Guid> targetTop20KeywordIds)
    {
        var groupedByDate = results.GroupBy(r => r.CheckDate).ToDictionary(g => g.Key, g => g.ToList());

        var latestDate = groupedByDate.Keys.OrderByDescending(k => k).FirstOrDefault();
        var latestResults = latestDate != default ? groupedByDate[latestDate] : new List<CompetitorRankResult>();

        var currentPositions = latestResults.Select(r => r.Position).ToList();
        var currentVisibility = SearchVisibilityCalculator.CalculateScore(currentPositions, totalKeywords);

        var rankedPositions = latestResults.Where(r => r.Position.HasValue && r.Position.Value > 0).Select(r => r.Position!.Value).ToList();
        decimal? currentAvg = rankedPositions.Count > 0 ? Math.Round((decimal)rankedPositions.Average(), 1) : null;

        var compTop20KeywordIds = latestResults
            .Where(r => r.Position.HasValue && r.Position.Value >= 1 && r.Position.Value <= 20)
            .Select(r => r.KeywordId)
            .ToHashSet();

        var overlapCount = compTop20KeywordIds.Count(kId => targetTop20KeywordIds.Contains(kId));
        var overlapPct = totalKeywords > 0 ? Math.Round((decimal)overlapCount / totalKeywords * 100m, 1) : 0m;

        var history = new List<CompetitorVisibilityPointDto>();
        for (var d = startDate; d <= endDate; d = d.AddDays(1))
        {
            if (groupedByDate.TryGetValue(d, out var dayResults))
            {
                var dayPositions = dayResults.Select(r => r.Position).ToList();
                var dayRanked = dayResults.Where(r => r.Position.HasValue && r.Position.Value > 0).Select(r => r.Position!.Value).ToList();

                history.Add(new CompetitorVisibilityPointDto
                {
                    Date = d.ToString("yyyy-MM-dd"),
                    Visibility = SearchVisibilityCalculator.CalculateScore(dayPositions, totalKeywords),
                    AveragePosition = dayRanked.Count > 0 ? Math.Round((decimal)dayRanked.Average(), 1) : null,
                    RankedKeywordsCount = dayRanked.Count
                });
            }
        }

        var top100Count = rankedPositions.Count(p => p <= 100);
        var unrankedCount = Math.Max(0, totalKeywords - top100Count);

        return new CompetitorVisibilitySummaryDto
        {
            CompetitorId = competitor.Id,
            Domain = competitor.Domain,
            Name = competitor.Name,
            IsTargetDomain = false,
            CurrentVisibility = currentVisibility,
            CurrentAveragePosition = currentAvg,
            CurrentRankedCount = rankedPositions.Count,
            Top3Count = rankedPositions.Count(p => p <= 3),
            Top10Count = rankedPositions.Count(p => p <= 10),
            Top20Count = rankedPositions.Count(p => p <= 20),
            Top30Count = rankedPositions.Count(p => p <= 30),
            Top100Count = top100Count,
            UnrankedCount = unrankedCount,
            Top20OverlapCount = overlapCount,
            Top20OverlapPercentage = overlapPct,
            History = history
        };
    }
}

