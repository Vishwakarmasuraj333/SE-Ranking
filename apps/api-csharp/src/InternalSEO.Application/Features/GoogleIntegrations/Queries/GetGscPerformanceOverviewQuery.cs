using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscPerformanceOverviewQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    string? Device = null
) : IRequest<ApiResponse<GscPerformanceOverviewDto>>;

public class GetGscPerformanceOverviewQueryHandler : IRequestHandler<GetGscPerformanceOverviewQuery, ApiResponse<GscPerformanceOverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGscPerformanceOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<GscPerformanceOverviewDto>> Handle(GetGscPerformanceOverviewQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = request.EndDate ?? today.AddDays(-1);
        var startDate = request.StartDate ?? endDate.AddDays(-27);
        var targetDevice = string.IsNullOrWhiteSpace(request.Device) ? "ALL" : request.Device.ToUpperInvariant();

        var dailyMetrics = await _context.GscDailyMetrics
            .AsNoTracking()
            .Where(d => d.ProjectId == request.ProjectId && d.MetricDate >= startDate && d.MetricDate <= endDate && d.Device == targetDevice)
            .OrderBy(d => d.MetricDate)
            .ToListAsync(cancellationToken);

        var allDeviceMetrics = await _context.GscDailyMetrics
            .AsNoTracking()
            .Where(d => d.ProjectId == request.ProjectId && d.MetricDate >= startDate && d.MetricDate <= endDate && d.Device != "ALL")
            .ToListAsync(cancellationToken);

        var totalClicks = dailyMetrics.Sum(d => d.Clicks);
        var totalImpressions = dailyMetrics.Sum(d => d.Impressions);
        var averageCtr = totalImpressions > 0 ? Math.Round((decimal)totalClicks / totalImpressions, 4) : 0m;
        var averagePosition = dailyMetrics.Count > 0 ? Math.Round(dailyMetrics.Average(d => d.AveragePosition), 2) : 0m;

        var dailySeries = dailyMetrics.Select(d => new GscDailyPointDto(
            d.MetricDate,
            d.Clicks,
            d.Impressions,
            d.Ctr,
            d.AveragePosition
        )).ToList();

        // Calculate device breakdown
        var deviceStats = new List<GscDeviceStatDto>();
        var groupedByDevice = allDeviceMetrics.GroupBy(d => d.Device);
        var totalAllDeviceClicks = allDeviceMetrics.Sum(d => d.Clicks);

        foreach (var group in groupedByDevice)
        {
            var devClicks = group.Sum(x => x.Clicks);
            var devImp = group.Sum(x => x.Impressions);
            var devCtr = devImp > 0 ? Math.Round((decimal)devClicks / devImp, 4) : 0m;
            var devAvgPos = group.Count() > 0 ? Math.Round(group.Average(x => x.AveragePosition), 2) : 0m;
            var clickShare = totalAllDeviceClicks > 0 ? Math.Round((decimal)devClicks / totalAllDeviceClicks, 4) : 0m;

            deviceStats.Add(new GscDeviceStatDto(
                group.Key,
                devClicks,
                devImp,
                devCtr,
                devAvgPos,
                clickShare
            ));
        }

        var dto = new GscPerformanceOverviewDto(
            TotalClicks: totalClicks,
            TotalImpressions: totalImpressions,
            AverageCtr: averageCtr,
            AveragePosition: averagePosition,
            StartDate: startDate,
            EndDate: endDate,
            DailySeries: dailySeries,
            DeviceBreakdown: deviceStats,
            LastSyncedAt: connection?.LastSyncedAt,
            SyncStatus: connection?.SyncStatus ?? GoogleConstants.SyncStatuses.Disconnected
        );

        return ApiResponse<GscPerformanceOverviewDto>.Succeeded(dto);
    }
}
