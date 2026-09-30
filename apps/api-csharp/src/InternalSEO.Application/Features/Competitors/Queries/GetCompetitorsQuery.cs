using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Queries;

public record GetCompetitorsQuery(Guid ProjectId) : IRequest<ApiResponse<List<CompetitorDto>>>;

public class GetCompetitorsQueryHandler : IRequestHandler<GetCompetitorsQuery, ApiResponse<List<CompetitorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCompetitorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<CompetitorDto>>> Handle(GetCompetitorsQuery request, CancellationToken cancellationToken)
    {
        var competitors = await _context.Competitors
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        // Fetch last checked date per competitor
        var compIds = competitors.Select(c => c.Id).ToList();
        var lastChecks = await _context.CompetitorRankResults
            .AsNoTracking()
            .Where(cr => compIds.Contains(cr.CompetitorId))
            .GroupBy(cr => cr.CompetitorId)
            .Select(g => new { CompetitorId = g.Key, LastChecked = g.Max(x => (DateTimeOffset?)x.RecordedAt) })
            .ToDictionaryAsync(x => x.CompetitorId, x => x.LastChecked, cancellationToken);

        var dtos = competitors.Select(c => new CompetitorDto
        {
            Id = c.Id,
            ProjectId = c.ProjectId,
            Name = c.Name,
            Domain = c.Domain,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            LastCheckedAt = lastChecks.TryGetValue(c.Id, out var dt) ? dt : null
        }).ToList();

        return ApiResponse<List<CompetitorDto>>.Succeeded(dtos);
    }
}
