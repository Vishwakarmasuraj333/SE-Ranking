using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetCrawlStatusQuery(Guid ProjectId, Guid? CrawlRunId = null) : IRequest<ApiResponse<CrawlRunDto?>>;

public class GetCrawlStatusQueryHandler : IRequestHandler<GetCrawlStatusQuery, ApiResponse<CrawlRunDto?>>
{
    private readonly IApplicationDbContext _context;

    public GetCrawlStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CrawlRunDto?>> Handle(GetCrawlStatusQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CrawlRuns
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId);

        if (request.CrawlRunId.HasValue)
        {
            query = query.Where(r => r.Id == request.CrawlRunId.Value);
        }
        else
        {
            // If no specific run requested, return active run if any, else latest run
            var activeRun = await query
                .Where(r => r.Status == "Queued" || r.Status == "Crawling" || r.Status == "Evaluating")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new CrawlRunDto
                {
                    Id = r.Id,
                    ProjectId = r.ProjectId,
                    Status = r.Status,
                    TriggerSource = r.TriggerSource,
                    StartedAt = r.StartedAt,
                    CompletedAt = r.CompletedAt,
                    UrlsDiscovered = r.UrlsDiscovered,
                    UrlsCrawled = r.UrlsCrawled,
                    ErrorsCount = r.ErrorsCount,
                    WarningsCount = r.WarningsCount,
                    NoticesCount = r.NoticesCount,
                    HealthScore = r.HealthScore,
                    FailureReason = r.FailureReason,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (activeRun != null)
            {
                return ApiResponse<CrawlRunDto?>.Succeeded(activeRun);
            }

            query = query.OrderByDescending(r => r.CreatedAt);
        }

        var run = await query
            .Select(r => new CrawlRunDto
            {
                Id = r.Id,
                ProjectId = r.ProjectId,
                Status = r.Status,
                TriggerSource = r.TriggerSource,
                StartedAt = r.StartedAt,
                CompletedAt = r.CompletedAt,
                UrlsDiscovered = r.UrlsDiscovered,
                UrlsCrawled = r.UrlsCrawled,
                ErrorsCount = r.ErrorsCount,
                WarningsCount = r.WarningsCount,
                NoticesCount = r.NoticesCount,
                HealthScore = r.HealthScore,
                FailureReason = r.FailureReason,
                CreatedAt = r.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        return ApiResponse<CrawlRunDto?>.Succeeded(run);
    }
}
