using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Queries;

public record GetGa4OverviewQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null
) : IRequest<ApiResponse<Ga4OverviewDto>>;

public class GetGa4OverviewQueryHandler : IRequestHandler<GetGa4OverviewQuery, ApiResponse<Ga4OverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGa4OverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<Ga4OverviewDto>> Handle(GetGa4OverviewQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null || string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            return ApiResponse<Ga4OverviewDto>.Failed("No active GA4 connection or property binding found for this project.");
        }

        var defaultEnd = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var defaultStart = defaultEnd.AddDays(-29);

        var startDate = request.StartDate ?? defaultStart;
        var endDate = request.EndDate ?? defaultEnd;

        if (startDate > endDate)
        {
            return ApiResponse<Ga4OverviewDto>.Failed("Start date must be earlier than or equal to end date.");
        }

        var dailyRecords = await _context.Ga4DailyMetrics
            .AsNoTracking()
            .Where(d => d.ProjectId == request.ProjectId 
                     && d.PropertyIdentifier == connection.PropertyIdentifier 
                     && d.MetricDate >= startDate 
                     && d.MetricDate <= endDate)
            .OrderBy(d => d.MetricDate)
            .ToListAsync(cancellationToken);

        int totalSessions = dailyRecords.Sum(d => d.Sessions);
        int totalActiveUsers = dailyRecords.Sum(d => d.ActiveUsers);
        int totalConversions = dailyRecords.Sum(d => d.Conversions);
        decimal totalRevenue = dailyRecords.Sum(d => d.Revenue);

        decimal avgEngagementRate = totalSessions > 0
            ? Math.Round(dailyRecords.Sum(d => d.EngagementRate * d.Sessions) / totalSessions, 4)
            : 0.0000m;

        var dailySeries = dailyRecords.Select(d => new Ga4DailyPointDto(
            d.MetricDate,
            d.Sessions,
            d.ActiveUsers,
            d.EngagementRate,
            d.Conversions,
            d.Revenue
        )).ToList();

        var dto = new Ga4OverviewDto(
            TotalSessions: totalSessions,
            TotalActiveUsers: totalActiveUsers,
            AverageEngagementRate: avgEngagementRate,
            TotalConversions: totalConversions,
            TotalRevenue: totalRevenue,
            StartDate: startDate,
            EndDate: endDate,
            DailySeries: dailySeries,
            LastSyncedAt: connection.LastSyncedAt,
            SyncStatus: connection.SyncStatus,
            PropertyIdentifier: connection.PropertyIdentifier
        );

        return ApiResponse<Ga4OverviewDto>.Succeeded(dto);
    }
}
