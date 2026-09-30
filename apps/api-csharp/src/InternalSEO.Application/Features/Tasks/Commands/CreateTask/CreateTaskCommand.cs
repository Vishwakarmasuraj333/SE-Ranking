using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Commands.CreateTask;

public record CreateTaskCommand(
    Guid ProjectId,
    string Title,
    string? Description = null,
    string? AffectedUrl = null,
    string Priority = "Medium",
    Guid? AssigneeId = null,
    DateOnly? DueDate = null,
    string? AcceptanceCriteria = null,
    Guid? SourceIssueId = null
) : IRequest<ApiResponse<Guid>>;

public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    private static readonly string[] AllowedPriorities = { "Critical", "High", "Medium", "Low" };

    public CreateTaskCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
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

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, ApiResponse<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;
    private readonly INotificationService _notificationService;

    public CreateTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger,
        INotificationService notificationService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException($"Project with ID '{request.ProjectId}' was not found.");
        }

        // Validate Assignee belongs to project
        if (request.AssigneeId.HasValue)
        {
            var isMember = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == request.ProjectId && pm.UserId == request.AssigneeId.Value, cancellationToken);

            if (!isMember)
            {
                throw new BadRequestException("The assigned user is not an authorized member of this project.");
            }
        }

        string? affectedUrl = request.AffectedUrl;
        string? acceptanceCriteria = request.AcceptanceCriteria;

        // If created from SourceIssue, link and populate defaults if missing
        if (request.SourceIssueId.HasValue)
        {
            var issue = await _context.AuditIssues
                .Include(i => i.Rule)
                .FirstOrDefaultAsync(i => i.Id == request.SourceIssueId.Value && i.ProjectId == request.ProjectId, cancellationToken);

            if (issue == null)
            {
                throw new NotFoundException($"AuditIssue with ID '{request.SourceIssueId.Value}' was not found in this project.");
            }

            if (string.IsNullOrWhiteSpace(affectedUrl))
            {
                affectedUrl = issue.AffectedUrl;
            }

            if (string.IsNullOrWhiteSpace(acceptanceCriteria) && issue.Rule != null)
            {
                acceptanceCriteria = $"Resolve {issue.RuleCode}: {issue.Rule.Recommendation}";
            }
        }

        var creatorId = _currentUserService.UserId ?? Guid.Empty;
        var initialStatus = request.AssigneeId.HasValue ? "Assigned" : "Open";

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            SourceIssueId = request.SourceIssueId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            AffectedUrl = affectedUrl?.Trim(),
            Priority = char.ToUpperInvariant(request.Priority[0]) + request.Priority.Substring(1).ToLowerInvariant(),
            Status = initialStatus,
            AssigneeId = request.AssigneeId,
            DueDate = request.DueDate,
            AcceptanceCriteria = acceptanceCriteria?.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedBy = creatorId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Task.Created",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { TaskId = task.Id, Title = task.Title, Status = task.Status, Priority = task.Priority, SourceIssueId = task.SourceIssueId },
            cancellationToken: cancellationToken);

        if (task.AssigneeId.HasValue)
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

        return ApiResponse<Guid>.Succeeded(task.Id, "Task successfully created.");
    }
}
