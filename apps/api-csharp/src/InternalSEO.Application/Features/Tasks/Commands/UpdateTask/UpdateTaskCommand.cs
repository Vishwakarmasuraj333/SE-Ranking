using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Commands.UpdateTask;

public record UpdateTaskCommand(
    Guid ProjectId,
    Guid TaskId,
    string Title,
    string? Description = null,
    string? AffectedUrl = null,
    string Priority = "Medium",
    Guid? AssigneeId = null,
    DateOnly? DueDate = null,
    string? AcceptanceCriteria = null
) : IRequest<ApiResponse<bool>>;

public class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    private static readonly string[] AllowedPriorities = { "Critical", "High", "Medium", "Low" };

    public UpdateTaskCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required.")
            .MaximumLength(300).WithMessage("Title cannot exceed 300 characters.");
        RuleFor(x => x.Priority)
            .Must(p => AllowedPriorities.Contains(p, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Priority must be one of: Critical, High, Medium, Low.");
        RuleFor(x => x.AffectedUrl)
            .MaximumLength(2048).WithMessage("Affected URL cannot exceed 2048 characters.");
    }
}

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly INotificationService _notificationService;

    public UpdateTaskCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        INotificationService notificationService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<bool>> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        if (request.AssigneeId.HasValue && request.AssigneeId != task.AssigneeId)
        {
            var isMember = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == request.ProjectId && pm.UserId == request.AssigneeId.Value, cancellationToken);

            if (!isMember)
            {
                throw new BadRequestException("The assigned user is not an authorized member of this project.");
            }
        }

        var previousAssigneeId = task.AssigneeId;

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim();
        task.AffectedUrl = request.AffectedUrl?.Trim();
        task.Priority = char.ToUpperInvariant(request.Priority[0]) + request.Priority.Substring(1).ToLowerInvariant();
        task.AssigneeId = request.AssigneeId;
        task.DueDate = request.DueDate;
        task.AcceptanceCriteria = request.AcceptanceCriteria?.Trim();
        task.UpdatedAt = DateTimeOffset.UtcNow;

        if (task.Status == "Open" && task.AssigneeId.HasValue)
        {
            task.Status = "Assigned";
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Task.Updated",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { TaskId = task.Id, Title = task.Title, Priority = task.Priority, AssigneeId = task.AssigneeId },
            cancellationToken: cancellationToken);

        if (task.AssigneeId != previousAssigneeId && task.AssigneeId.HasValue)
        {
            await _activityLogger.LogAsync(
                actionType: "Task.Assigned",
                entityType: "Task",
                entityId: task.Id.ToString(),
                projectId: request.ProjectId,
                payload: new { TaskId = task.Id, AssigneeId = task.AssigneeId.Value },
                cancellationToken: cancellationToken);

            var targetUrl = $"/projects/{request.ProjectId}/tasks/{task.Id}";
            await _notificationService.CreateDirectNotificationAsync(
                projectId: request.ProjectId,
                userId: task.AssigneeId.Value,
                title: "Task Assigned",
                message: $"You have been assigned to task '{task.Title}'.",
                severity: "Info",
                eventType: "TaskAssigned",
                targetUrl: targetUrl,
                cancellationToken: cancellationToken);
        }

        return ApiResponse<bool>.Succeeded(true, "Task successfully updated.");
    }
}
