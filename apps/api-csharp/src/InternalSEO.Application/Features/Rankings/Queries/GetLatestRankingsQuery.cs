using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetLatestRankingsQuery(
    Guid ProjectId,
    string? Search = null,
    string? Device = null,
    int PageNumber = 1,
    int PageSize = 25
) : IRequest<ApiResponse<PaginatedList<KeywordRankDto>>>;

public class GetLatestRankingsQueryHandler : IRequestHandler<GetLatestRankingsQuery, ApiResponse<PaginatedList<KeywordRankDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLatestRankingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<KeywordRankDto>>> Handle(GetLatestRankingsQuery request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AsNoTracking()
            .AnyAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (!projectExists)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        var query = _context.Keywords
            .AsNoTracking()
            .Include(k => k.Group)
            .Where(k => k.ProjectId == request.ProjectId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(k => k.KeywordText.ToLower().Contains(term) ||
                                     (k.TargetUrl != null && k.TargetUrl.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(request.Device) && request.Device.ToLower() != "all")
        {
            query = query.Where(k => k.Device.ToLower() == request.Device.ToLower());
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var keywords = await query
            .OrderBy(k => k.KeywordText)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var keywordIds = keywords.Select(k => k.Id).ToList();

        // Get latest rank result for each of these keywords
        var latestResults = await _context.RankResults
            .AsNoTracking()
            .Where(r => keywordIds.Contains(r.KeywordId))
            .GroupBy(r => r.KeywordId)
            .Select(g => g.OrderByDescending(r => r.CheckDate).First())
            .ToListAsync(cancellationToken);

        var rankDict = latestResults.ToDictionary(r => r.KeywordId);

        var items = keywords.Select(k =>
        {
            rankDict.TryGetValue(k.Id, out var rank);
            return new KeywordRankDto
            {
                KeywordId = k.Id,
                KeywordText = k.KeywordText,
                GroupName = k.Group?.Name,
                SearchEngine = k.SearchEngine,
                Device = k.Device,
                CountryCode = k.CountryCode,
                TargetUrl = k.TargetUrl,
                RankedUrl = rank?.RankedUrl,
                CurrentPosition = rank?.Position,
                PreviousPosition = rank?.PreviousPosition,
                PositionChange = rank?.PositionChange,
                IsTargetUrlMatched = rank?.IsTargetUrlMatched ?? false,
                CheckDate = rank?.CheckDate.ToString("yyyy-MM-dd"),
                LastCheckedAt = rank?.RecordedAt ?? k.LastCheckedAt
            };
        }).ToList();

        var paginated = new PaginatedList<KeywordRankDto>(
            items,
            totalCount,
            request.PageNumber,
            request.PageSize
        );

        return ApiResponse<PaginatedList<KeywordRankDto>>.Succeeded(paginated);
    }
}
