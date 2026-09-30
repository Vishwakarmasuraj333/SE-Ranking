using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetAuditIssuesQuery(
    Guid ProjectId,
    Guid? CrawlRunId = null,
    string? Severity = null,
    string? Category = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<ApiResponse<PaginatedList<AuditIssueDto>>>;

public class GetAuditIssuesQueryHandler : IRequestHandler<GetAuditIssuesQuery, ApiResponse<PaginatedList<AuditIssueDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditIssuesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<AuditIssueDto>>> Handle(GetAuditIssuesQuery request, CancellationToken cancellationToken)
    {
        // If CrawlRunId is not specified, select the latest completed run
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
            return ApiResponse<PaginatedList<AuditIssueDto>>.Succeeded(
                new PaginatedList<AuditIssueDto>(new List<AuditIssueDto>(), 0, request.PageNumber, request.PageSize));
        }

        var query = _context.AuditIssues
            .AsNoTracking()
            .Include(i => i.Rule)
            .Include(i => i.Evidence)
            .Where(i => i.ProjectId == request.ProjectId && i.CrawlRunId == targetRunId.Value);

        if (!string.IsNullOrWhiteSpace(request.Severity))
        {
            query = query.Where(i => i.Severity.ToLower() == request.Severity.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(i => i.Rule.Category.ToLower() == request.Category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(i => i.AffectedUrl.ToLower().Contains(search) ||
                                     i.RuleCode.ToLower().Contains(search) ||
                                     i.Rule.Title.ToLower().Contains(search));
        }

        query = query.OrderBy(i => i.Severity == "Error" ? 0 : i.Severity == "Warning" ? 1 : 2)
                     .ThenBy(i => i.RuleCode)
                     .ThenBy(i => i.AffectedUrl);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(i => new AuditIssueDto
            {
                Id = i.Id,
                CrawlRunId = i.CrawlRunId,
                ProjectId = i.ProjectId,
                RuleCode = i.RuleCode,
                RuleTitle = i.Rule.Title,
                RuleCategory = i.Rule.Category,
                Severity = i.Severity,
                AffectedUrl = i.AffectedUrl,
                AffectedUrlHash = i.AffectedUrlHash,
                Status = i.Status,
                FirstSeenAt = i.FirstSeenAt,
                LastSeenAt = i.LastSeenAt,
                CreatedAt = i.CreatedAt,
                EvidenceCount = i.Evidence.Count
            })
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<AuditIssueDto>(items, totalCount, request.PageNumber, request.PageSize);
        return ApiResponse<PaginatedList<AuditIssueDto>>.Succeeded(result);
    }
}
