using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscDeviceBreakdownQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null
) : IRequest<ApiResponse<IReadOnlyList<GscDeviceStatDto>>>;

public class GetGscDeviceBreakdownQueryHandler : IRequestHandler<GetGscDeviceBreakdownQuery, ApiResponse<IReadOnlyList<GscDeviceStatDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGscDeviceBreakdownQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<IReadOnlyList<GscDeviceStatDto>>> Handle(GetGscDeviceBreakdownQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = request.EndDate ?? today.AddDays(-1);
        var startDate = request.StartDate ?? endDate.AddDays(-27);

        var deviceMetrics = await _context.GscDailyMetrics
            .AsNoTracking()
            .Where(d => d.ProjectId == request.ProjectId && d.MetricDate >= startDate && d.MetricDate <= endDate && d.Device != "ALL")
            .ToListAsync(cancellationToken);

        var totalClicks = deviceMetrics.Sum(d => d.Clicks);
        var result = new List<GscDeviceStatDto>();

        var grouped = deviceMetrics.GroupBy(d => d.Device);
        foreach (var g in grouped)
        {
            var dClicks = g.Sum(x => x.Clicks);
            var dImp = g.Sum(x => x.Impressions);
            var dCtr = dImp > 0 ? Math.Round((decimal)dClicks / dImp, 4) : 0m;
            var dAvgPos = g.Count() > 0 ? Math.Round(g.Average(x => x.AveragePosition), 2) : 0m;
            var share = totalClicks > 0 ? Math.Round((decimal)dClicks / totalClicks, 4) : 0m;

            result.Add(new GscDeviceStatDto(g.Key, dClicks, dImp, dCtr, dAvgPos, share));
        }

        return ApiResponse<IReadOnlyList<GscDeviceStatDto>>.Succeeded(result.OrderByDescending(r => r.Clicks).ToList());
    }
}
