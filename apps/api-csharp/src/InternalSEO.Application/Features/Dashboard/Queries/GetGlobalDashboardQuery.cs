using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Dashboard.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Dashboard.Queries;

public record GetGlobalDashboardQuery : IRequest<ApiResponse<GlobalDashboardDto>>;

public class GetGlobalDashboardQueryHandler : IRequestHandler<GetGlobalDashboardQuery, ApiResponse<GlobalDashboardDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetGlobalDashboardQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<GlobalDashboardDto>> Handle(GetGlobalDashboardQuery request, CancellationToken cancellationToken)
    {
        var isSuperAdmin = _currentUserService.IsSuperAdmin;
        var currentUserId = _currentUserService.UserId;

        var projectsQuery = _context.Projects.AsNoTracking().Where(p => !p.IsArchived && p.Status == ProjectStatus.Active);

        if (!isSuperAdmin)
        {
            if (!currentUserId.HasValue)
            {
                return ApiResponse<GlobalDashboardDto>.Succeeded(new GlobalDashboardDto(
                    TotalProjects: 0,
                    TotalTrackedKeywords: 0,
                    AverageHealthScore: null,
                    TotalOpenTasks: 0,
                    TotalOverdueTasks: 0,
                    Projects: Array.Empty<GlobalProjectSummaryDto>()
                ));
            }

            projectsQuery = projectsQuery.Where(p => p.Members.Any(m => m.UserId == currentUserId.Value));
        }

        var projects = await projectsQuery
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        if (projects.Count == 0)
        {
            return ApiResponse<GlobalDashboardDto>.Succeeded(new GlobalDashboardDto(
                TotalProjects: 0,
                TotalTrackedKeywords: 0,
                AverageHealthScore: null,
                TotalOpenTasks: 0,
                TotalOverdueTasks: 0,
                Projects: Array.Empty<GlobalProjectSummaryDto>()
            ));
        }

        var projectIds = projects.Select(p => p.Id).ToList();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Keywords count per project
        var keywordCounts = await _context.Keywords
            .AsNoTracking()
            .Where(k => projectIds.Contains(k.ProjectId))
            .GroupBy(k => k.ProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count, cancellationToken);

        // Latest completed crawl per project
        var latestCrawls = await _context.CrawlRuns
            .AsNoTracking()
            .Where(c => projectIds.Contains(c.ProjectId) && c.Status == "Completed")
            .GroupBy(c => c.ProjectId)
            .Select(g => g.OrderByDescending(c => c.CreatedAt).First())
            .ToDictionaryAsync(x => x.ProjectId, x => x, cancellationToken);

        // GSC connection per project
        var gscConnections = await _context.GoogleConnections
            .AsNoTracking()
            .Where(c => projectIds.Contains(c.ProjectId) && c.ServiceType == GoogleConstants.ServiceTypes.Gsc)
            .ToDictionaryAsync(x => x.ProjectId, x => x, cancellationToken);

        // Tasks per project
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => projectIds.Contains(t.ProjectId))
            .ToListAsync(cancellationToken);

        var tasksByProject = tasks.GroupBy(t => t.ProjectId).ToDictionary(g => g.Key, g => g.ToList());

        var projectSummaries = new List<GlobalProjectSummaryDto>();

        foreach (var p in projects)
        {
            var kwCount = keywordCounts.GetValueOrDefault(p.Id, 0);
            latestCrawls.TryGetValue(p.Id, out var crawl);
            gscConnections.TryGetValue(p.Id, out var gsc);
            var projTasks = tasksByProject.GetValueOrDefault(p.Id, new List<InternalSEO.Domain.Entities.TaskItem>());

            int openTasks = projTasks.Count(t => t.Status != "Closed" && t.Status != "Verified");
            int overdueTasks = projTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < today && t.Status != "Closed" && t.Status != "Verified");

            projectSummaries.Add(new GlobalProjectSummaryDto(
                ProjectId: p.Id,
                Name: p.Name,
                PrimaryDomain: p.PrimaryDomain,
                HealthScore: crawl?.HealthScore,
                TrackedKeywords: kwCount,
                OpenTasks: openTasks,
                OverdueTasks: overdueTasks,
                LastCrawledAt: crawl?.CompletedAt,
                LastSyncedAt: gsc?.LastSyncedAt,
                GscSyncStatus: gsc?.SyncStatus ?? GoogleConstants.SyncStatuses.Disconnected
            ));
        }

        var healthScores = projectSummaries.Where(p => p.HealthScore.HasValue).Select(p => p.HealthScore!.Value).ToList();
        decimal? avgHealth = healthScores.Count > 0 ? Math.Round(healthScores.Average(), 1) : null;

        var globalDto = new GlobalDashboardDto(
            TotalProjects: projectSummaries.Count,
            TotalTrackedKeywords: projectSummaries.Sum(p => p.TrackedKeywords),
            AverageHealthScore: avgHealth,
            TotalOpenTasks: projectSummaries.Sum(p => p.OpenTasks),
            TotalOverdueTasks: projectSummaries.Sum(p => p.OverdueTasks),
            Projects: projectSummaries
        );

        return ApiResponse<GlobalDashboardDto>.Succeeded(globalDto);
    }
}
