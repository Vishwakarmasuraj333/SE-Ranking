using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscCountryBreakdownQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    int TopCount = 10
) : IRequest<ApiResponse<IReadOnlyList<GscCountryStatDto>>>;

public class GetGscCountryBreakdownQueryHandler : IRequestHandler<GetGscCountryBreakdownQuery, ApiResponse<IReadOnlyList<GscCountryStatDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGscCountryBreakdownQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<IReadOnlyList<GscCountryStatDto>>> Handle(GetGscCountryBreakdownQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = request.EndDate ?? today.AddDays(-1);
        var startDate = request.StartDate ?? endDate.AddDays(-27);

        var queryMetrics = await _context.GscQueryMetrics
            .AsNoTracking()
            .Where(q => q.ProjectId == request.ProjectId && q.MetricDate >= startDate && q.MetricDate <= endDate && q.CountryCode != "ALL")
            .ToListAsync(cancellationToken);

        var totalClicks = queryMetrics.Sum(q => q.Clicks);
        var result = new List<GscCountryStatDto>();

        var grouped = queryMetrics.GroupBy(q => q.CountryCode);
        foreach (var g in grouped)
        {
            var cClicks = g.Sum(x => x.Clicks);
            var cImp = g.Sum(x => x.Impressions);
            var cCtr = cImp > 0 ? Math.Round((decimal)cClicks / cImp, 4) : 0m;
            var cAvgPos = g.Count() > 0 ? Math.Round(g.Average(x => x.Position), 2) : 0m;
            var share = totalClicks > 0 ? Math.Round((decimal)cClicks / totalClicks, 4) : 0m;

            result.Add(new GscCountryStatDto(g.Key, cClicks, cImp, cCtr, cAvgPos, share));
        }

        var top = result
            .OrderByDescending(r => r.Clicks)
            .Take(request.TopCount)
            .ToList();

        return ApiResponse<IReadOnlyList<GscCountryStatDto>>.Succeeded(top);
    }
}
