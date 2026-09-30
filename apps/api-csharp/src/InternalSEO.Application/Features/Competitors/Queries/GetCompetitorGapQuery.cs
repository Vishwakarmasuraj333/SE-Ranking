using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.Common;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Queries;

public record GetCompetitorGapQuery(
    Guid ProjectId,
    string? Search = null,
    Guid? CompetitorId = null,
    string? Sort = null,
    int PageNumber = 1,
    int PageSize = 25
) : IRequest<ApiResponse<CompetitorGapResponseDto>>;

public class GetCompetitorGapQueryHandler : IRequestHandler<GetCompetitorGapQuery, ApiResponse<CompetitorGapResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCompetitorGapQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CompetitorGapResponseDto>> Handle(GetCompetitorGapQuery request, CancellationToken cancellationToken)
    {
        // 1. Verify project exists
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new NotFoundException(nameof(Project), request.ProjectId);

        // 2. If CompetitorId filter is provided, verify competitor belongs to this project
        if (request.CompetitorId.HasValue)
        {
            var competitorExistsInProject = await _context.Competitors
                .AsNoTracking()
                .AnyAsync(c => c.Id == request.CompetitorId.Value && c.ProjectId == request.ProjectId, cancellationToken);

            if (!competitorExistsInProject)
                throw new NotFoundException(nameof(Competitor), request.CompetitorId.Value);
        }

        // 3. Fetch project competitors
        var competitors = await _context.Competitors
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var competitorDict = competitors.ToDictionary(c => c.Id);
        var competitorDtos = competitors.Select(c => new CompetitorDto
        {
            Id = c.Id,
            ProjectId = c.ProjectId,
            Name = c.Name,
            Domain = c.Domain,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        // 4. Fetch competitor rank observations for project (filtered by CompetitorId if supplied)
        var compRankQuery = _context.CompetitorRankResults
            .AsNoTracking()
            .Where(cr => cr.ProjectId == request.ProjectId);

        if (request.CompetitorId.HasValue)
        {
            compRankQuery = compRankQuery.Where(cr => cr.CompetitorId == request.CompetitorId.Value);
        }

        var allCompObservations = await compRankQuery
            .OrderByDescending(cr => cr.CheckDate)
            .ThenByDescending(cr => cr.RecordedAt)
            .ToListAsync(cancellationToken);

        // Deduplicate in memory to get the latest observation per (KeywordId, CompetitorId)
        var latestCompByKeywordAndComp = allCompObservations
            .GroupBy(cr => new { cr.KeywordId, cr.CompetitorId })
            .Select(g => g.First())
            .ToList();

        // Only keep observations where competitor's latest position is in Top 20 (1 <= Position <= 20)
        var top20CompObservations = latestCompByKeywordAndComp
            .Where(cr => cr.Position.HasValue && cr.Position.Value >= 1 && cr.Position.Value <= 20)
            .ToList();

        int page = request.PageNumber <= 0 ? 1 : request.PageNumber;
        int size = request.PageSize <= 0 ? 25 : Math.Min(request.PageSize, 100);

        DateTimeOffset? latestCompCheck = allCompObservations.Count > 0
            ? allCompObservations.Max(x => (DateTimeOffset?)x.RecordedAt)
            : null;

        DateOnly? latestCheckDate = allCompObservations.Count > 0
            ? allCompObservations.Max(x => (DateOnly?)x.CheckDate)
            : null;

        if (top20CompObservations.Count == 0)
        {
            return ApiResponse<CompetitorGapResponseDto>.Succeeded(new CompetitorGapResponseDto
            {
                Items = new List<CompetitorGapItemDto>(),
                TotalCount = 0,
                PageNumber = page,
                PageSize = size,
                Competitors = competitorDtos,
                LatestCheckDate = latestCheckDate,
                LastCheckedAt = latestCompCheck,
                IsStale = !latestCompCheck.HasValue || (DateTimeOffset.UtcNow - latestCompCheck.Value).TotalHours > 48
            });
        }

        // 5. Candidate keyword IDs that have at least one competitor in Top 20
        var candidateKeywordIds = top20CompObservations.Select(cr => cr.KeywordId).Distinct().ToList();

        // 6. Fetch latest target domain observations for candidate keywords
        var allTargetObservations = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && candidateKeywordIds.Contains(r.KeywordId))
            .OrderByDescending(r => r.CheckDate)
            .ThenByDescending(r => r.RecordedAt)
            .ToListAsync(cancellationToken);

        var latestTargetByKeyword = allTargetObservations
            .GroupBy(r => r.KeywordId)
            .ToDictionary(g => g.Key, g => g.First());

        DateTimeOffset? latestTargetCheck = allTargetObservations.Count > 0
            ? allTargetObservations.Max(x => (DateTimeOffset?)x.RecordedAt)
            : null;

        DateTimeOffset? lastCheckedAt = null;
        if (latestTargetCheck.HasValue && latestCompCheck.HasValue)
            lastCheckedAt = latestTargetCheck.Value > latestCompCheck.Value ? latestTargetCheck.Value : latestCompCheck.Value;
        else
            lastCheckedAt = latestTargetCheck ?? latestCompCheck;

        var isStale = !lastCheckedAt.HasValue || (DateTimeOffset.UtcNow - lastCheckedAt.Value).TotalHours > 48;

        // 7. Filter: Target domain must NOT rank in Top 20 (position null or position > 20)
        var qualifyingKeywordIds = candidateKeywordIds
            .Where(kId => !latestTargetByKeyword.TryGetValue(kId, out var tr) ||
                          !tr.Position.HasValue ||
                          tr.Position.Value > 20 ||
                          tr.Position.Value < 1)
            .ToHashSet();

        if (qualifyingKeywordIds.Count == 0)
        {
            return ApiResponse<CompetitorGapResponseDto>.Succeeded(new CompetitorGapResponseDto
            {
                Items = new List<CompetitorGapItemDto>(),
                TotalCount = 0,
                PageNumber = page,
                PageSize = size,
                Competitors = competitorDtos,
                LatestCheckDate = latestCheckDate,
                LastCheckedAt = lastCheckedAt,
                IsStale = isStale
            });
        }

        // 8. Fetch keywords (both active and inactive) from existing project catalogue
        var keywordsQuery = _context.Keywords
            .AsNoTracking()
            .Where(k => k.ProjectId == request.ProjectId && qualifyingKeywordIds.Contains(k.Id));

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLowerInvariant();
            keywordsQuery = keywordsQuery.Where(k => k.KeywordText.ToLower().Contains(s));
        }

        var keywords = await keywordsQuery.ToListAsync(cancellationToken);

        // Group competitor observations by KeywordId
        var top20ByKeyword = top20CompObservations
            .GroupBy(cr => cr.KeywordId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // 9. Build gap item DTOs with Opportunity Score and best competitor
        var gapItems = new List<CompetitorGapItemDto>();

        foreach (var kw in keywords)
        {
            if (!top20ByKeyword.TryGetValue(kw.Id, out var compObsList) || compObsList.Count == 0)
                continue;

            // Deterministic selection of best competitor:
            // Lowest numeric position wins. Ties broken by CompetitorId ascending.
            var bestCompObs = compObsList
                .OrderBy(cr => cr.Position!.Value)
                .ThenBy(cr => cr.CompetitorId)
                .First();

            competitorDict.TryGetValue(bestCompObs.CompetitorId, out var bestCompEntity);

            double opportunityScore = OpportunityScoreCalculator.Calculate(
                kw.MonthlySearchVolume,
                bestCompObs.Position!.Value);

            int? targetPosition = null;
            string? targetUrl = null;
            if (latestTargetByKeyword.TryGetValue(kw.Id, out var targetResult))
            {
                targetPosition = targetResult.Position;
                targetUrl = targetResult.RankedUrl;
            }

            var item = new CompetitorGapItemDto
            {
                KeywordId = kw.Id,
                KeywordText = kw.KeywordText,
                IsActive = kw.IsActive,
                SearchVolume = kw.MonthlySearchVolume,
                KeywordDifficulty = kw.KeywordDifficulty,
                CpcUsd = kw.CpcUsd,
                TargetPosition = targetPosition,
                TargetRankedUrl = targetUrl,
                BestCompetitorId = bestCompObs.CompetitorId,
                BestCompetitorName = bestCompEntity?.Name ?? "Unknown Competitor",
                BestCompetitorDomain = bestCompEntity?.Domain ?? string.Empty,
                BestCompetitorPosition = bestCompObs.Position!.Value,
                BestCompetitorRankedUrl = bestCompObs.RankedUrl,
                OpportunityScore = opportunityScore,
                CheckDate = bestCompObs.CheckDate,
                CompetitorRanks = compObsList.Select(cr =>
                {
                    competitorDict.TryGetValue(cr.CompetitorId, out var c);
                    return new CompetitorGapRankDto
                    {
                        CompetitorId = cr.CompetitorId,
                        CompetitorName = c?.Name ?? "Unknown",
                        CompetitorDomain = c?.Domain ?? string.Empty,
                        Position = cr.Position,
                        RankedUrl = cr.RankedUrl
                    };
                }).OrderBy(r => r.Position ?? 999).ThenBy(r => r.CompetitorId).ToList()
            };

            gapItems.Add(item);
        }

        // 10. Sorting
        var sort = request.Sort?.Trim().ToLowerInvariant() ?? "opportunityscore";
        gapItems = sort switch
        {
            "searchvolume" => gapItems.OrderByDescending(x => x.SearchVolume ?? 0)
                                      .ThenByDescending(x => x.OpportunityScore)
                                      .ThenBy(x => x.KeywordText)
                                      .ToList(),
            "bestcompetitorrank" => gapItems.OrderBy(x => x.BestCompetitorPosition)
                                            .ThenByDescending(x => x.OpportunityScore)
                                            .ThenBy(x => x.KeywordText)
                                            .ToList(),
            "keyword" => gapItems.OrderBy(x => x.KeywordText)
                                 .ThenByDescending(x => x.OpportunityScore)
                                 .ToList(),
            _ => gapItems.OrderByDescending(x => x.OpportunityScore)
                         .ThenBy(x => x.BestCompetitorPosition)
                         .ThenBy(x => x.KeywordText)
                         .ToList() // default: opportunityScore
        };

        // 11. Pagination
        int totalCount = gapItems.Count;
        var pagedItems = gapItems
            .Skip((page - 1) * size)
            .Take(size)
            .ToList();

        var response = new CompetitorGapResponseDto
        {
            Items = pagedItems,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = size,
            Competitors = competitorDtos,
            LatestCheckDate = latestCheckDate,
            LastCheckedAt = lastCheckedAt,
            IsStale = isStale
        };

        return ApiResponse<CompetitorGapResponseDto>.Succeeded(response);
    }
}
