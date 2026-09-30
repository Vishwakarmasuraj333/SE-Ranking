using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Commands.PatchTaskStatus;

public record PatchTaskStatusCommand(
    Guid ProjectId,
    Guid TaskId,
    string Status
) : IRequest<ApiResponse<bool>>;

public class PatchTaskStatusCommandValidator : AbstractValidator<PatchTaskStatusCommand>
{
    private static readonly string[] AllowedStatuses = {
        "Open", "Assigned", "InProgress", "ReadyForVerification", "Verified", "Closed", "Blocked", "Reopened"
    };

    public PatchTaskStatusCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(s => AllowedStatuses.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Invalid status value.");
    }
}

public class PatchTaskStatusCommandHandler : IRequestHandler<PatchTaskStatusCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public PatchTaskStatusCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<bool>> Handle(PatchTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var targetStatus = NormalizeStatus(request.Status);
        var currentStatus = task.Status;

        if (currentStatus.Equals(targetStatus, StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<bool>.Succeeded(true, "Task is already in the requested status.");
        }

        // Enforce state machine rule: API caller cannot directly mark a task Verified
        if (targetStatus == "Verified")
        {
            throw new BadRequestException("Task status cannot be directly changed to 'Verified'. Tasks are verified automatically via the verification recheck workflow.");
        }

        if (!IsValidTransition(currentStatus, targetStatus))
        {
            throw new BadRequestException($"Invalid status transition from '{currentStatus}' to '{targetStatus}'.");
        }

        task.Status = targetStatus;
        task.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Task.StatusChanged",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { TaskId = task.Id, OldStatus = currentStatus, NewStatus = targetStatus },
            cancellationToken: cancellationToken);

        return ApiResponse<bool>.Succeeded(true, $"Task status changed to '{targetStatus}'.");
    }

    private static string NormalizeStatus(string status)
    {
        var match = new[] { "Open", "Assigned", "InProgress", "ReadyForVerification", "Verified", "Closed", "Blocked", "Reopened" }
            .FirstOrDefault(s => s.Equals(status, StringComparison.OrdinalIgnoreCase));

        return match ?? status;
    }

    private static bool IsValidTransition(string current, string target)
    {
        return current switch
        {
            "Open" => target is "Assigned" or "InProgress" or "Closed" or "Blocked",
            "Assigned" => target is "InProgress" or "Blocked" or "Closed" or "Open",
            "InProgress" => target is "ReadyForVerification" or "Blocked" or "Assigned" or "Closed",
            "Blocked" => target is "InProgress" or "Assigned" or "Closed" or "Open",
            "ReadyForVerification" => target is "InProgress" or "Blocked" or "Closed" or "Reopened",
            "Verified" => target is "Closed" or "Reopened",
            "Reopened" => target is "InProgress" or "Assigned" or "Blocked" or "ReadyForVerification" or "Closed",
            "Closed" => target is "Open" or "Reopened" or "InProgress",
            _ => false
        };
    }
}
