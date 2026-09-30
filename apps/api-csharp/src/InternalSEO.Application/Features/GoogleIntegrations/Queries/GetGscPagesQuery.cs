using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscPagesQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 50,
    string? SortBy = "clicks",
    bool SortDescending = true
) : IRequest<ApiResponse<PaginatedList<GscPageRowDto>>>;

public class GetGscPagesQueryHandler : IRequestHandler<GetGscPagesQuery, ApiResponse<PaginatedList<GscPageRowDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGscPagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<GscPageRowDto>>> Handle(GetGscPagesQuery request, CancellationToken cancellationToken)
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
            query = query.Where(q => q.PageUrl.ToLower().Contains(s));
        }

        var grouped = query
            .GroupBy(q => q.PageUrl)
            .Select(g => new
            {
                PageUrl = g.Key,
                Clicks = g.Sum(x => x.Clicks),
                Impressions = g.Sum(x => x.Impressions),
                PositionSum = g.Sum(x => (double)x.Position * x.Impressions),
                PositionCount = g.Sum(x => x.Impressions),
                AvgPosition = g.Average(x => (double)x.Position),
                QueryCount = g.Select(x => x.QueryText).Distinct().Count()
            });

        var rawList = await grouped.ToListAsync(cancellationToken);

        var projected = rawList.Select(g => new GscPageRowDto(
            PageUrl: g.PageUrl,
            Clicks: g.Clicks,
            Impressions: g.Impressions,
            Ctr: g.Impressions > 0 ? Math.Round((decimal)g.Clicks / g.Impressions, 4) : 0m,
            AveragePosition: g.PositionCount > 0 ? Math.Round((decimal)(g.PositionSum / g.PositionCount), 2) : Math.Round((decimal)g.AvgPosition, 2),
            QueryCount: g.QueryCount
        ));

        // Sorting
        var sortProp = (request.SortBy ?? "clicks").ToLowerInvariant();
        var isDesc = request.SortDescending;

        var sorted = sortProp switch
        {
            "page" or "pageurl" => isDesc ? projected.OrderByDescending(x => x.PageUrl) : projected.OrderBy(x => x.PageUrl),
            "impressions" => isDesc ? projected.OrderByDescending(x => x.Impressions) : projected.OrderBy(x => x.Impressions),
            "ctr" => isDesc ? projected.OrderByDescending(x => x.Ctr) : projected.OrderBy(x => x.Ctr),
            "position" or "averageposition" => isDesc ? projected.OrderByDescending(x => x.AveragePosition) : projected.OrderBy(x => x.AveragePosition),
            "queries" or "querycount" => isDesc ? projected.OrderByDescending(x => x.QueryCount) : projected.OrderBy(x => x.QueryCount),
            _ => isDesc ? projected.OrderByDescending(x => x.Clicks) : projected.OrderBy(x => x.Clicks)
        };

        var totalCount = rawList.Count;
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 50 : request.PageSize;

        var items = sorted.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var paginated = new PaginatedList<GscPageRowDto>(items, totalCount, page, pageSize);
        return ApiResponse<PaginatedList<GscPageRowDto>>.Succeeded(paginated);
    }
}
