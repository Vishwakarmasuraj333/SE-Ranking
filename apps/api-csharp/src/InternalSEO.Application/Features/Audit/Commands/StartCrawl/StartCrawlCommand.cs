using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Audit.Commands.StartCrawl;

public record StartCrawlCommand(Guid ProjectId) : IRequest<ApiResponse<Guid>>;

public class StartCrawlCommandValidator : AbstractValidator<StartCrawlCommand>
{
    public StartCrawlCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
    }
}

public class StartCrawlCommandHandler : IRequestHandler<StartCrawlCommand, ApiResponse<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICrawlJobEnqueuer _crawlJobEnqueuer;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public StartCrawlCommandHandler(
        IApplicationDbContext context,
        ICrawlJobEnqueuer crawlJobEnqueuer,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _crawlJobEnqueuer = crawlJobEnqueuer;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<Guid>> Handle(StartCrawlCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        // Check if an active crawl is already running or queued
        var hasActiveCrawl = await _context.CrawlRuns
            .AnyAsync(r => r.ProjectId == request.ProjectId &&
                           (r.Status == "Queued" || r.Status == "Crawling" || r.Status == "Evaluating"),
                      cancellationToken);

        if (hasActiveCrawl)
        {
            throw new BadRequestException("A crawl run is already in progress or queued for this project.");
        }

        var crawlRun = new CrawlRun
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Status = "Queued",
            TriggerSource = "Manual",
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        _context.CrawlRuns.Add(crawlRun);
        await _context.SaveChangesAsync(cancellationToken);

        _crawlJobEnqueuer.EnqueueCrawlJob(crawlRun.Id);

        await _activityLogger.LogAsync(
            actionType: "Crawl.Enqueued",
            entityType: "CrawlRun",
            entityId: crawlRun.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { CrawlRunId = crawlRun.Id },
            cancellationToken: cancellationToken);

        return ApiResponse<Guid>.Succeeded(crawlRun.Id, "Crawl job successfully queued.");
    }
}
