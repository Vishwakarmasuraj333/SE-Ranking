using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Commands.UpdateCrawlSettings;

public record UpdateCrawlSettingsCommand(
    Guid ProjectId,
    int CrawlMaxPages,
    int CrawlMaxDepth,
    int CrawlConcurrency,
    int CrawlRateLimitMs,
    bool CrawlRespectRobotsTxt,
    string CrawlUserAgent
) : IRequest<ApiResponse<ProjectSettingsDto>>;

public class UpdateCrawlSettingsCommandValidator : AbstractValidator<UpdateCrawlSettingsCommand>
{
    public UpdateCrawlSettingsCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.CrawlMaxPages)
            .InclusiveBetween(1, 10000).WithMessage("Max pages must be between 1 and 10,000.");

        RuleFor(x => x.CrawlMaxDepth)
            .InclusiveBetween(1, 20).WithMessage("Max depth must be between 1 and 20.");

        RuleFor(x => x.CrawlConcurrency)
            .InclusiveBetween(1, 10).WithMessage("Concurrency must be between 1 and 10.");

        RuleFor(x => x.CrawlRateLimitMs)
            .InclusiveBetween(50, 5000).WithMessage("Rate limit delay must be between 50ms and 5000ms.");

        RuleFor(x => x.CrawlUserAgent)
            .NotEmpty().WithMessage("User agent is required.")
            .MaximumLength(200).WithMessage("User agent cannot exceed 200 characters.");
    }
}

public class UpdateCrawlSettingsCommandHandler : IRequestHandler<UpdateCrawlSettingsCommand, ApiResponse<ProjectSettingsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public UpdateCrawlSettingsCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<ProjectSettingsDto>> Handle(UpdateCrawlSettingsCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Settings)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        var settings = project.Settings;
        if (settings == null)
        {
            settings = new ProjectSettings { ProjectId = request.ProjectId };
            _context.ProjectSettings.Add(settings);
        }

        settings.CrawlMaxPages = request.CrawlMaxPages;
        settings.CrawlMaxDepth = request.CrawlMaxDepth;
        settings.CrawlConcurrency = request.CrawlConcurrency;
        settings.CrawlRateLimitMs = request.CrawlRateLimitMs;
        settings.CrawlRespectRobotsTxt = request.CrawlRespectRobotsTxt;
        settings.CrawlUserAgent = request.CrawlUserAgent.Trim();
        settings.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Settings.Updated",
            entityType: "ProjectSettings",
            entityId: project.Id.ToString(),
            projectId: project.Id,
            payload: new { request.CrawlMaxPages, request.CrawlMaxDepth, request.CrawlRateLimitMs },
            cancellationToken: cancellationToken);

        var dto = new ProjectSettingsDto
        {
            ProjectId = settings.ProjectId,
            CrawlMaxPages = settings.CrawlMaxPages,
            CrawlMaxDepth = settings.CrawlMaxDepth,
            CrawlConcurrency = settings.CrawlConcurrency,
            CrawlRateLimitMs = settings.CrawlRateLimitMs,
            CrawlRespectRobotsTxt = settings.CrawlRespectRobotsTxt,
            CrawlUserAgent = settings.CrawlUserAgent,
            RankTrackingFrequency = settings.RankTrackingFrequency,
            RankTrackingTime = settings.RankTrackingTime,
            UpdatedAt = settings.UpdatedAt
        };

        return ApiResponse<ProjectSettingsDto>.Succeeded(dto, "Crawl settings updated successfully.");
    }
}
