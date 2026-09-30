using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetCrawlPagesQuery(
    Guid ProjectId,
    Guid? CrawlRunId = null,
    int? StatusCode = null,
    bool? IsIndexable = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<ApiResponse<PaginatedList<CrawlPageDto>>>;

public class GetCrawlPagesQueryHandler : IRequestHandler<GetCrawlPagesQuery, ApiResponse<PaginatedList<CrawlPageDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCrawlPagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<CrawlPageDto>>> Handle(GetCrawlPagesQuery request, CancellationToken cancellationToken)
    {
        Guid? targetRunId = request.CrawlRunId;
        if (!targetRunId.HasValue)
        {
            targetRunId = await _context.CrawlRuns
                .AsNoTracking()
                .Where(r => r.ProjectId == request.ProjectId && r.Status == "Completed")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (Guid?)r.Id)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (!targetRunId.HasValue)
        {
            return ApiResponse<PaginatedList<CrawlPageDto>>.Succeeded(
                new PaginatedList<CrawlPageDto>(new List<CrawlPageDto>(), 0, request.PageNumber, request.PageSize));
        }

        var query = _context.CrawlPages
            .AsNoTracking()
            .Where(p => p.ProjectId == request.ProjectId && p.CrawlRunId == targetRunId.Value);

        if (request.StatusCode.HasValue)
        {
            query = query.Where(p => p.HttpStatusCode == request.StatusCode.Value);
        }

        if (request.IsIndexable.HasValue)
        {
            query = query.Where(p => p.IsIndexable == request.IsIndexable.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p => p.Url.ToLower().Contains(search) || (p.Title != null && p.Title.ToLower().Contains(search)));
        }

        query = query.OrderBy(p => p.CrawlDepth).ThenBy(p => p.Url);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new CrawlPageDto
            {
                Id = p.Id,
                CrawlRunId = p.CrawlRunId,
                Url = p.Url,
                HttpStatusCode = p.HttpStatusCode,
                ContentType = p.ContentType,
                ContentLengthBytes = p.ContentLengthBytes,
                LoadTimeMs = p.LoadTimeMs,
                CrawlDepth = p.CrawlDepth,
                Title = p.Title,
                TitleLength = p.TitleLength,
                MetaDescription = p.MetaDescription,
                H1 = p.H1,
                H1Count = p.H1Count,
                CanonicalUrl = p.CanonicalUrl,
                IsIndexable = p.IsIndexable,
                IndexabilityStatus = p.IndexabilityStatus,
                InlinksCount = p.InlinksCount,
                OutlinksCount = p.OutlinksCount,
                CrawledAt = p.CrawledAt
            })
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<CrawlPageDto>(items, totalCount, request.PageNumber, request.PageSize);
        return ApiResponse<PaginatedList<CrawlPageDto>>.Succeeded(result);
    }
}
