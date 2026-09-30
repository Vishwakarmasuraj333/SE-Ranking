using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Commands.EnqueueVerification;

public record EnqueueTaskVerificationCommand(
    Guid ProjectId,
    Guid TaskId
) : IRequest<ApiResponse<TaskVerificationDto>>;

public class EnqueueTaskVerificationCommandValidator : AbstractValidator<EnqueueTaskVerificationCommand>
{
    public EnqueueTaskVerificationCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
    }
}

public class EnqueueTaskVerificationCommandHandler : IRequestHandler<EnqueueTaskVerificationCommand, ApiResponse<TaskVerificationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITaskVerificationEnqueuer _enqueuer;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public EnqueueTaskVerificationCommandHandler(
        IApplicationDbContext context,
        ITaskVerificationEnqueuer enqueuer,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _enqueuer = enqueuer;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<TaskVerificationDto>> Handle(EnqueueTaskVerificationCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.SourceIssue)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var affectedUrl = task.AffectedUrl ?? task.SourceIssue?.AffectedUrl;
        if (string.IsNullOrWhiteSpace(affectedUrl))
        {
            throw new BadRequestException("Cannot verify task: Task does not have an affected URL specified.");
        }

        // Update task status to ReadyForVerification
        task.Status = "ReadyForVerification";
        task.UpdatedAt = DateTimeOffset.UtcNow;

        var verification = new TaskVerification
        {
            TaskId = task.Id,
            AttemptedAt = DateTimeOffset.UtcNow,
            Status = "Queued",
            VerifiedByUserId = _currentUserService.UserId
        };

        _context.TaskVerifications.Add(verification);
        await _context.SaveChangesAsync(cancellationToken);

        _enqueuer.EnqueueVerificationJob(verification.Id);

        await _activityLogger.LogAsync(
            actionType: "Task.SubmittedForVerification",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { TaskId = task.Id, TaskVerificationId = verification.Id, AffectedUrl = affectedUrl },
            cancellationToken: cancellationToken);

        var dto = new TaskVerificationDto
        {
            Id = verification.Id,
            TaskId = verification.TaskId,
            AttemptedAt = verification.AttemptedAt,
            Status = verification.Status,
            Details = "Verification check queued for background worker execution.",
            VerifiedByUserId = verification.VerifiedByUserId
        };

        return ApiResponse<TaskVerificationDto>.Succeeded(dto, "Verification job successfully queued.");
    }
}
