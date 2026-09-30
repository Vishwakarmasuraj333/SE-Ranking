using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Commands.AddComment;

public record AddTaskCommentCommand(
    Guid ProjectId,
    Guid TaskId,
    string CommentText
) : IRequest<ApiResponse<TaskCommentDto>>;

public class AddTaskCommentCommandValidator : AbstractValidator<AddTaskCommentCommand>
{
    public AddTaskCommentCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");

        RuleFor(x => x.CommentText)
            .NotEmpty().WithMessage("Comment text cannot be empty.")
            .MaximumLength(4000).WithMessage("Comment text cannot exceed 4000 characters.");
    }
}

public class AddTaskCommentCommandHandler : IRequestHandler<AddTaskCommentCommand, ApiResponse<TaskCommentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public AddTaskCommentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<TaskCommentDto>> Handle(AddTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue || currentUserId.Value == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Authenticated user identity is required to post a task comment.");
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUserId.Value, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{currentUserId.Value}' was not found.");
        }

        var comment = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            UserId = currentUserId.Value,
            CommentText = request.CommentText.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        // Immutable activity logging for task comment mutation
        await _activityLogger.LogAsync(
            actionType: "Task.CommentAdded",
            entityType: "Task",
            entityId: task.Id.ToString(),
            projectId: request.ProjectId,
            payload: new
            {
                TaskId = task.Id,
                CommentId = comment.Id,
                AuthorId = currentUserId,
                CommentLength = comment.CommentText.Length
            },
            cancellationToken: cancellationToken);

        var dto = new TaskCommentDto
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = $"{user.FirstName} {user.LastName}".Trim(),
            UserEmail = user.Email,
            CommentText = comment.CommentText,
            CreatedAt = comment.CreatedAt
        };

        return ApiResponse<TaskCommentDto>.Succeeded(dto, "Comment posted successfully.");
    }
}
