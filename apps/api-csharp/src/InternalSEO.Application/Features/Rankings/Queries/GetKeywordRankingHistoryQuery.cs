using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Rankings.Queries;

public record GetKeywordRankingHistoryQuery(
    Guid ProjectId,
    Guid KeywordId,
    int Days = 30
) : IRequest<ApiResponse<List<RankObservationHistoryDto>>>;

public class GetKeywordRankingHistoryQueryHandler : IRequestHandler<GetKeywordRankingHistoryQuery, ApiResponse<List<RankObservationHistoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetKeywordRankingHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<RankObservationHistoryDto>>> Handle(GetKeywordRankingHistoryQuery request, CancellationToken cancellationToken)
    {
        // Enforce strict project isolation: verify keyword belongs to this project
        var keyword = await _context.Keywords
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.Id == request.KeywordId && k.ProjectId == request.ProjectId, cancellationToken);

        if (keyword == null)
        {
            throw new NotFoundException($"Keyword with ID {request.KeywordId} was not found in project {request.ProjectId}.");
        }

        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-Math.Max(1, request.Days));

        var observations = await _context.RankResults
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId && r.KeywordId == request.KeywordId && r.CheckDate >= cutoffDate)
            .OrderByDescending(r => r.CheckDate)
            .Select(r => new RankObservationHistoryDto
            {
                CheckDate = r.CheckDate.ToString("yyyy-MM-dd"),
                Position = r.Position,
                PositionChange = r.PositionChange,
                RankedUrl = r.RankedUrl,
                Device = keyword.Device,
                Location = keyword.LocationName ?? keyword.CountryCode,
                SearchEngine = keyword.SearchEngine,
                Provider = r.ProviderName,
                RecordedAt = r.RecordedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<RankObservationHistoryDto>>.Succeeded(observations);
    }
}
