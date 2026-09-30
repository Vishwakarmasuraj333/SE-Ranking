using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Queries;

public record GetCompetitorKeywordsQuery(
    Guid ProjectId,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 25
) : IRequest<ApiResponse<CompetitorKeywordsResponseDto>>;

public class GetCompetitorKeywordsQueryHandler : IRequestHandler<GetCompetitorKeywordsQuery, ApiResponse<CompetitorKeywordsResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCompetitorKeywordsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CompetitorKeywordsResponseDto>> Handle(GetCompetitorKeywordsQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new NotFoundException(nameof(Project), request.ProjectId);

        var competitors = await _context.Competitors
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

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

        var query = _context.Keywords
            .AsNoTracking()
            .Where(k => k.ProjectId == request.ProjectId && k.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(k => k.KeywordText.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var page = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var size = request.PageSize <= 0 ? 25 : Math.Min(request.PageSize, 100);

        var keywords = await query
            .OrderBy(k => k.KeywordText)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var keywordIds = keywords.Select(k => k.Id).ToList();

        // Fetch latest target RankResults for these keywords
        var latestTargetResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => keywordIds.Contains(r.KeywordId))
            .GroupBy(r => r.KeywordId)
            .Select(g => g.OrderByDescending(r => r.CheckDate).FirstOrDefault()!)
            .ToListAsync(cancellationToken);

        var targetMap = latestTargetResults.ToDictionary(r => r.KeywordId);

        // Fetch latest competitor RankResults for these keywords
        var latestCompResults = await _context.CompetitorRankResults
            .AsNoTracking()
            .Where(cr => keywordIds.Contains(cr.KeywordId))
            .GroupBy(cr => new { cr.KeywordId, cr.CompetitorId })
            .Select(g => g.OrderByDescending(cr => cr.CheckDate).FirstOrDefault()!)
            .ToListAsync(cancellationToken);

        var compMap = latestCompResults
            .GroupBy(cr => cr.KeywordId)
            .ToDictionary(g => g.Key, g => g.ToDictionary(x => x.CompetitorId));

        // Determine LastCheckedAt
        DateTimeOffset? latestTargetCheck = latestTargetResults.Count > 0
            ? latestTargetResults.Max(r => (DateTimeOffset?)r.RecordedAt)
            : null;

        DateTimeOffset? latestCompCheck = latestCompResults.Count > 0
            ? latestCompResults.Max(cr => (DateTimeOffset?)cr.RecordedAt)
            : null;

        DateTimeOffset? lastCheckedAt = null;
        if (latestTargetCheck.HasValue && latestCompCheck.HasValue)
            lastCheckedAt = latestTargetCheck.Value > latestCompCheck.Value ? latestTargetCheck.Value : latestCompCheck.Value;
        else
            lastCheckedAt = latestTargetCheck ?? latestCompCheck;

        var isStale = !lastCheckedAt.HasValue || (DateTimeOffset.UtcNow - lastCheckedAt.Value).TotalHours > 48;

        var items = new List<CompetitorKeywordRankingDto>();
        foreach (var kw in keywords)
        {
            var item = new CompetitorKeywordRankingDto
            {
                KeywordId = kw.Id,
                KeywordText = kw.KeywordText,
                SearchVolume = kw.MonthlySearchVolume
            };

            if (targetMap.TryGetValue(kw.Id, out var tr))
            {
                item.TargetPosition = tr.Position;
                item.TargetPreviousPosition = tr.PreviousPosition;
                item.TargetPositionChange = tr.PositionChange;
                item.TargetRankedUrl = tr.RankedUrl;
            }

            if (compMap.TryGetValue(kw.Id, out var compDict))
            {
                foreach (var kv in compDict)
                {
                    item.CompetitorRanks[kv.Key] = new CompetitorRankCellDto
                    {
                        CompetitorId = kv.Key,
                        Position = kv.Value.Position,
                        PreviousPosition = kv.Value.PreviousPosition,
                        PositionChange = kv.Value.PositionChange,
                        RankedUrl = kv.Value.RankedUrl
                    };
                }
            }

            items.Add(item);
        }

        var response = new CompetitorKeywordsResponseDto
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = size,
            Competitors = competitorDtos,
            LastCheckedAt = lastCheckedAt,
            IsStale = isStale
        };

        return ApiResponse<CompetitorKeywordsResponseDto>.Succeeded(response);
    }
}
