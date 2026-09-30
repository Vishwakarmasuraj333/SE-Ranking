using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetAuditOverviewQuery(Guid ProjectId) : IRequest<ApiResponse<AuditOverviewDto>>;

public class GetAuditOverviewQueryHandler : IRequestHandler<GetAuditOverviewQuery, ApiResponse<AuditOverviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<AuditOverviewDto>> Handle(GetAuditOverviewQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        var recentRuns = await _context.CrawlRuns
            .AsNoTracking()
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
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
            .ToListAsync(cancellationToken);

        var lastRun = recentRuns.FirstOrDefault(r => r.Status == "Completed") ?? recentRuns.FirstOrDefault();

        var overview = new AuditOverviewDto
        {
            LastCrawlRun = lastRun,
            HealthScore = lastRun?.HealthScore,
            UrlsCrawled = lastRun?.UrlsCrawled ?? 0,
            ErrorsCount = lastRun?.ErrorsCount ?? 0,
            WarningsCount = lastRun?.WarningsCount ?? 0,
            NoticesCount = lastRun?.NoticesCount ?? 0,
            RecentRuns = recentRuns
        };

        if (lastRun != null)
        {
            overview.IssueCountsBySeverity = new Dictionary<string, int>
            {
                ["Error"] = lastRun.ErrorsCount,
                ["Warning"] = lastRun.WarningsCount,
                ["Notice"] = lastRun.NoticesCount
            };

            // Calculate issues by category for the latest run
            var categoryBreakdown = await _context.AuditIssues
                .AsNoTracking()
                .Where(i => i.CrawlRunId == lastRun.Id)
                .Join(_context.AuditRules,
                    issue => issue.RuleCode,
                    rule => rule.Id,
                    (issue, rule) => rule.Category)
                .GroupBy(cat => cat)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Category, x => x.Count, cancellationToken);

            overview.IssuesByCategory = categoryBreakdown;

            // Fetch top 5 issues
            overview.TopIssues = await _context.AuditIssues
                .AsNoTracking()
                .Where(i => i.CrawlRunId == lastRun.Id)
                .OrderBy(i => i.Severity == "Error" ? 0 : i.Severity == "Warning" ? 1 : 2)
                .ThenBy(i => i.RuleCode)
                .Take(5)
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
        }

        return ApiResponse<AuditOverviewDto>.Succeeded(overview);
    }
}
