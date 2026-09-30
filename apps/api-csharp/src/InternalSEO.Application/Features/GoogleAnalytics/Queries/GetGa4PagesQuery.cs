using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Queries;

public record GetGa4PagesQuery(
    Guid ProjectId,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 50,
    string? SortBy = "sessions",
    bool SortDescending = true
) : IRequest<ApiResponse<PaginatedList<Ga4PageRowDto>>>;

public class GetGa4PagesQueryValidator : AbstractValidator<GetGa4PagesQuery>
{
    public GetGa4PagesQueryValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        RuleFor(x => x)
            .Must(x => !x.StartDate.HasValue || !x.EndDate.HasValue || x.StartDate.Value <= x.EndDate.Value)
            .WithMessage("Start date must be earlier than or equal to end date.");
    }
}

public class GetGa4PagesQueryHandler : IRequestHandler<GetGa4PagesQuery, ApiResponse<PaginatedList<Ga4PageRowDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGa4PagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<Ga4PageRowDto>>> Handle(GetGa4PagesQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null || string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            return ApiResponse<PaginatedList<Ga4PageRowDto>>.Failed("No active GA4 connection or property binding found for this project.");
        }

        var defaultEnd = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var defaultStart = defaultEnd.AddDays(-29);

        var startDate = request.StartDate ?? defaultStart;
        var endDate = request.EndDate ?? defaultEnd;

        var query = _context.Ga4LandingPageMetrics
            .AsNoTracking()
            .Where(p => p.ProjectId == request.ProjectId
                     && p.PropertyIdentifier == connection.PropertyIdentifier
                     && p.MetricDate >= startDate
                     && p.MetricDate <= endDate);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLowerInvariant();
            query = query.Where(p => p.LandingPage.ToLower().Contains(s));
        }

        var grouped = query
            .GroupBy(p => p.LandingPage)
            .Select(g => new
            {
                LandingPage = g.Key,
                Sessions = g.Sum(x => x.Sessions),
                ActiveUsers = g.Sum(x => x.ActiveUsers),
                Conversions = g.Sum(x => x.Conversions),
                Revenue = g.Sum(x => x.Revenue),
                SessionWeightedEngagementSum = g.Sum(x => x.EngagementRate * (decimal)x.Sessions),
            });

        var rawList = await grouped.ToListAsync(cancellationToken);

        var projected = rawList.Select(g => new Ga4PageRowDto(
            LandingPage: g.LandingPage,
            Sessions: g.Sessions,
            ActiveUsers: g.ActiveUsers,
            EngagementRate: g.Sessions > 0 ? Math.Round(g.SessionWeightedEngagementSum / g.Sessions, 4) : 0m,
            Conversions: g.Conversions,
            Revenue: g.Revenue
        ));

        var sortProp = (request.SortBy ?? "sessions").ToLowerInvariant();
        var isDesc = request.SortDescending;

        var sorted = sortProp switch
        {
            "landingpage" or "page" => isDesc ? projected.OrderByDescending(x => x.LandingPage) : projected.OrderBy(x => x.LandingPage),
            "activeusers" or "users" => isDesc ? projected.OrderByDescending(x => x.ActiveUsers) : projected.OrderBy(x => x.ActiveUsers),
            "engagementrate" => isDesc ? projected.OrderByDescending(x => x.EngagementRate) : projected.OrderBy(x => x.EngagementRate),
            "conversions" => isDesc ? projected.OrderByDescending(x => x.Conversions) : projected.OrderBy(x => x.Conversions),
            "revenue" => isDesc ? projected.OrderByDescending(x => x.Revenue) : projected.OrderBy(x => x.Revenue),
            _ => isDesc ? projected.OrderByDescending(x => x.Sessions) : projected.OrderBy(x => x.Sessions)
        };

        var totalCount = rawList.Count;
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 50 : request.PageSize;

        var items = sorted.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var paginated = new PaginatedList<Ga4PageRowDto>(items, totalCount, page, pageSize);
        return ApiResponse<PaginatedList<Ga4PageRowDto>>.Succeeded(paginated);
    }
}
