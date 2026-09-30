using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Queries;

public record GetTaskDetailQuery(Guid ProjectId, Guid TaskId) : IRequest<ApiResponse<TaskDetailDto>>;

public class GetTaskDetailQueryValidator : AbstractValidator<GetTaskDetailQuery>
{
    public GetTaskDetailQueryValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
    }
}

public class GetTaskDetailQueryHandler : IRequestHandler<GetTaskDetailQuery, ApiResponse<TaskDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTaskDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<TaskDetailDto>> Handle(GetTaskDetailQuery request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.SourceIssue)
                .ThenInclude(i => i!.Rule)
            .Include(t => t.SourceIssue)
                .ThenInclude(i => i!.Evidence)
            .Include(t => t.Verifications)
                .ThenInclude(v => v.VerifiedByUser)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var dto = new TaskDetailDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            SourceIssueId = task.SourceIssueId,
            SourceIssueRuleCode = task.SourceIssue?.RuleCode,
            SourceIssueRuleTitle = task.SourceIssue?.Rule?.Title,
            SourceIssueSeverity = task.SourceIssue?.Severity,
            SourceIssueRecommendation = task.SourceIssue?.Rule?.Recommendation,
            Title = task.Title,
            Description = task.Description,
            AffectedUrl = task.AffectedUrl,
            Priority = task.Priority,
            Status = task.Status,
            AssigneeId = task.AssigneeId,
            AssigneeName = task.Assignee != null ? $"{task.Assignee.FirstName} {task.Assignee.LastName}".Trim() : null,
            AssigneeEmail = task.Assignee?.Email,
            DueDate = task.DueDate,
            AcceptanceCriteria = task.AcceptanceCriteria,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CreatedBy = task.CreatedBy,
            Verifications = task.Verifications
                .OrderByDescending(v => v.AttemptedAt)
                .Select(v => new TaskVerificationDto
                {
                    Id = v.Id,
                    TaskId = v.TaskId,
                    VerifiedByRunId = v.VerifiedByRunId,
                    AttemptedAt = v.AttemptedAt,
                    CompletedAt = v.CompletedAt,
                    Status = v.Status,
                    Details = v.Details,
                    VerifiedByUserId = v.VerifiedByUserId,
                    VerifiedByUserName = v.VerifiedByUser != null ? $"{v.VerifiedByUser.FirstName} {v.VerifiedByUser.LastName}".Trim() : null
                }).ToList(),
            Comments = task.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new TaskCommentDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}".Trim() : "Unknown User",
                    UserEmail = c.User?.Email ?? string.Empty,
                    CommentText = c.CommentText,
                    CreatedAt = c.CreatedAt
                }).ToList(),
            Evidence = task.SourceIssue?.Evidence
                .OrderBy(e => e.Id)
                .Select(e => new TaskIssueEvidenceDto
                {
                    Id = e.Id,
                    EvidenceType = e.EvidenceType,
                    EvidencePayload = e.EvidencePayload,
                    CreatedAt = e.CreatedAt
                }).ToList() ?? new List<TaskIssueEvidenceDto>()
        };

        dto.LatestVerification = dto.Verifications.FirstOrDefault();

        return ApiResponse<TaskDetailDto>.Succeeded(dto);
    }
}
