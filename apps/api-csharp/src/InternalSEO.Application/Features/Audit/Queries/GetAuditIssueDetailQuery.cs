using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetAuditIssueDetailQuery(Guid ProjectId, Guid IssueId) : IRequest<ApiResponse<AuditIssueDetailDto>>;

public class GetAuditIssueDetailQueryHandler : IRequestHandler<GetAuditIssueDetailQuery, ApiResponse<AuditIssueDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditIssueDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<AuditIssueDetailDto>> Handle(GetAuditIssueDetailQuery request, CancellationToken cancellationToken)
    {
        var issue = await _context.AuditIssues
            .AsNoTracking()
            .Include(i => i.Rule)
            .Include(i => i.Evidence)
            .FirstOrDefaultAsync(i => i.Id == request.IssueId && i.ProjectId == request.ProjectId, cancellationToken);

        if (issue == null)
        {
            throw new NotFoundException($"Audit issue with ID '{request.IssueId}' was not found.");
        }

        var dto = new AuditIssueDetailDto
        {
            Id = issue.Id,
            CrawlRunId = issue.CrawlRunId,
            ProjectId = issue.ProjectId,
            RuleCode = issue.RuleCode,
            RuleTitle = issue.Rule.Title,
            RuleCategory = issue.Rule.Category,
            Severity = issue.Severity,
            AffectedUrl = issue.AffectedUrl,
            AffectedUrlHash = issue.AffectedUrlHash,
            Status = issue.Status,
            Description = issue.Rule.Description,
            Recommendation = issue.Rule.Recommendation,
            FirstSeenAt = issue.FirstSeenAt,
            LastSeenAt = issue.LastSeenAt,
            CreatedAt = issue.CreatedAt,
            Evidence = issue.Evidence.Select(e => new IssueEvidenceDto
            {
                Id = e.Id,
                IssueId = e.IssueId,
                EvidenceType = e.EvidenceType,
                EvidencePayload = e.EvidencePayload,
                CreatedAt = e.CreatedAt
            }).ToList()
        };

        return ApiResponse<AuditIssueDetailDto>.Succeeded(dto);
    }
}
