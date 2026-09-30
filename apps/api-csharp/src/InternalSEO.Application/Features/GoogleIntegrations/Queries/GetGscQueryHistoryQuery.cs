using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscQueryHistoryQuery(
    Guid ProjectId,
    string QueryText,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null
) : IRequest<ApiResponse<GscQueryDetailDto>>;

public class GetGscQueryHistoryQueryHandler : IRequestHandler<GetGscQueryHistoryQuery, ApiResponse<GscQueryDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGscQueryHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<GscQueryDetailDto>> Handle(GetGscQueryHistoryQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = request.EndDate ?? today.AddDays(-1);
        var startDate = request.StartDate ?? endDate.AddDays(-27);

        var queryRows = await _context.GscQueryMetrics
            .AsNoTracking()
            .Where(q => q.ProjectId == request.ProjectId && q.QueryText.ToLower() == request.QueryText.ToLower() && q.MetricDate >= startDate && q.MetricDate <= endDate)
            .OrderBy(q => q.MetricDate)
            .ToListAsync(cancellationToken);

        if (queryRows.Count == 0)
        {
            var empty = new GscQueryDetailDto(
                QueryText: request.QueryText,
                TotalClicks: 0,
                TotalImpressions: 0,
                AverageCtr: 0m,
                AveragePosition: 0m,
                TopPages: Array.Empty<string>(),
                History: Array.Empty<GscQueryDailyPointDto>()
            );
            return ApiResponse<GscQueryDetailDto>.Succeeded(empty);
        }

        var totalClicks = queryRows.Sum(x => x.Clicks);
        var totalImp = queryRows.Sum(x => x.Impressions);
        var avgCtr = totalImp > 0 ? Math.Round((decimal)totalClicks / totalImp, 4) : 0m;
        var avgPos = queryRows.Count > 0 ? Math.Round(queryRows.Average(x => x.Position), 2) : 0m;

        var topPages = queryRows
            .GroupBy(x => x.PageUrl)
            .OrderByDescending(g => g.Sum(x => x.Clicks))
            .Select(g => g.Key)
            .Take(5)
            .ToList();

        var dailyHistory = queryRows
            .GroupBy(x => x.MetricDate)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var dClicks = g.Sum(x => x.Clicks);
                var dImp = g.Sum(x => x.Impressions);
                var dCtr = dImp > 0 ? Math.Round((decimal)dClicks / dImp, 4) : 0m;
                var dPos = Math.Round(g.Average(x => x.Position), 2);
                return new GscQueryDailyPointDto(g.Key, dClicks, dImp, dCtr, dPos);
            })
            .ToList();

        var dto = new GscQueryDetailDto(
            QueryText: request.QueryText,
            TotalClicks: totalClicks,
            TotalImpressions: totalImp,
            AverageCtr: avgCtr,
            AveragePosition: avgPos,
            TopPages: topPages,
            History: dailyHistory
        );

        return ApiResponse<GscQueryDetailDto>.Succeeded(dto);
    }
}
