using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscQueriesQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    string? Search = null,
    string? Device = null,
    string? Country = null,
    int Page = 1,
    int PageSize = 50,
    string? SortBy = "clicks",
    bool SortDescending = true
) : IRequest<ApiResponse<PaginatedList<GscQueryRowDto>>>;

public class GetGscQueriesQueryHandler : IRequestHandler<GetGscQueriesQuery, ApiResponse<PaginatedList<GscQueryRowDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGscQueriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<GscQueryRowDto>>> Handle(GetGscQueriesQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = request.EndDate ?? today.AddDays(-1);
        var startDate = request.StartDate ?? endDate.AddDays(-27);

        var query = _context.GscQueryMetrics
            .AsNoTracking()
            .Where(q => q.ProjectId == request.ProjectId && q.MetricDate >= startDate && q.MetricDate <= endDate);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLowerInvariant();
            query = query.Where(q => q.QueryText.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(request.Device) && !request.Device.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(q => q.Device == request.Device.ToUpperInvariant());
        }

        if (!string.IsNullOrWhiteSpace(request.Country) && !request.Country.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(q => q.CountryCode == request.Country.ToUpperInvariant());
        }

        // Group by query text
        var grouped = query
            .GroupBy(q => q.QueryText)
            .Select(g => new
            {
                QueryText = g.Key,
                PageUrl = g.OrderByDescending(x => x.Clicks).Select(x => x.PageUrl).FirstOrDefault() ?? string.Empty,
                CountryCode = g.OrderByDescending(x => x.Clicks).Select(x => x.CountryCode).FirstOrDefault() ?? "ALL",
                Device = g.OrderByDescending(x => x.Clicks).Select(x => x.Device).FirstOrDefault() ?? "ALL",
                Clicks = g.Sum(x => x.Clicks),
                Impressions = g.Sum(x => x.Impressions),
                PositionSum = g.Sum(x => (double)x.Position * x.Impressions),
                PositionCount = g.Sum(x => x.Impressions),
                AvgPosition = g.Average(x => (double)x.Position)
            });

        var rawList = await grouped.ToListAsync(cancellationToken);

        var projected = rawList.Select(g => new GscQueryRowDto(
            QueryText: g.QueryText,
            PageUrl: g.PageUrl,
            CountryCode: g.CountryCode,
            Device: g.Device,
            Clicks: g.Clicks,
            Impressions: g.Impressions,
            Ctr: g.Impressions > 0 ? Math.Round((decimal)g.Clicks / g.Impressions, 4) : 0m,
            Position: g.PositionCount > 0 ? Math.Round((decimal)(g.PositionSum / g.PositionCount), 2) : Math.Round((decimal)g.AvgPosition, 2)
        ));

        // Sorting
        var sortProp = (request.SortBy ?? "clicks").ToLowerInvariant();
        var isDesc = request.SortDescending;

        var sorted = sortProp switch
        {
            "query" or "querytext" => isDesc ? projected.OrderByDescending(x => x.QueryText) : projected.OrderBy(x => x.QueryText),
            "impressions" => isDesc ? projected.OrderByDescending(x => x.Impressions) : projected.OrderBy(x => x.Impressions),
            "ctr" => isDesc ? projected.OrderByDescending(x => x.Ctr) : projected.OrderBy(x => x.Ctr),
            "position" => isDesc ? projected.OrderByDescending(x => x.Position) : projected.OrderBy(x => x.Position),
            _ => isDesc ? projected.OrderByDescending(x => x.Clicks) : projected.OrderBy(x => x.Clicks)
        };

        var totalCount = rawList.Count;
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 50 : request.PageSize;

        var items = sorted.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var paginated = new PaginatedList<GscQueryRowDto>(items, totalCount, page, pageSize);
        return ApiResponse<PaginatedList<GscQueryRowDto>>.Succeeded(paginated);
    }
}
