using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Queries;

public record GetTaskCommentsQuery(
    Guid ProjectId,
    Guid TaskId
) : IRequest<ApiResponse<List<TaskCommentDto>>>;

public class GetTaskCommentsQueryValidator : AbstractValidator<GetTaskCommentsQuery>
{
    public GetTaskCommentsQueryValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
    }
}

public class GetTaskCommentsQueryHandler : IRequestHandler<GetTaskCommentsQuery, ApiResponse<List<TaskCommentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTaskCommentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<TaskCommentDto>>> Handle(GetTaskCommentsQuery request, CancellationToken cancellationToken)
    {
        var taskExists = await _context.Tasks
            .AsNoTracking()
            .AnyAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (!taskExists)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var comments = await _context.TaskComments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.TaskId == request.TaskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new TaskCommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                UserId = c.UserId,
                UserName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}".Trim() : "Unknown User",
                UserEmail = c.User != null ? c.User.Email : string.Empty,
                CommentText = c.CommentText,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<TaskCommentDto>>.Succeeded(comments);
    }
}
