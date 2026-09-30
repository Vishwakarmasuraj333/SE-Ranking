using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Queries;

public record GetCrawlSettingsQuery(Guid ProjectId) : IRequest<ApiResponse<ProjectSettingsDto>>;

public class GetCrawlSettingsQueryHandler : IRequestHandler<GetCrawlSettingsQuery, ApiResponse<ProjectSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCrawlSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<ProjectSettingsDto>> Handle(GetCrawlSettingsQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Settings)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        var settings = project.Settings;
        var dto = new ProjectSettingsDto
        {
            ProjectId = project.Id,
            CrawlMaxPages = settings?.CrawlMaxPages ?? 100,
            CrawlMaxDepth = settings?.CrawlMaxDepth ?? 5,
            CrawlConcurrency = settings?.CrawlConcurrency ?? 2,
            CrawlRateLimitMs = settings?.CrawlRateLimitMs ?? 100,
            CrawlRespectRobotsTxt = settings?.CrawlRespectRobotsTxt ?? true,
            CrawlUserAgent = settings?.CrawlUserAgent ?? "InternalSEOPlatformBot/1.0",
            RankTrackingFrequency = settings?.RankTrackingFrequency ?? "Daily",
            RankTrackingTime = settings?.RankTrackingTime ?? TimeSpan.Zero,
            UpdatedAt = settings?.UpdatedAt ?? project.UpdatedAt
        };

        return ApiResponse<ProjectSettingsDto>.Succeeded(dto);
    }
}
