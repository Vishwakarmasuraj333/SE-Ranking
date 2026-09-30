using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Queries;

public record GetTasksQuery(
    Guid ProjectId,
    string? Status = null,
    string? Priority = null,
    Guid? AssigneeId = null,
    Guid? SourceIssueId = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<ApiResponse<PaginatedList<TaskDto>>>;

public class GetTasksQueryValidator : AbstractValidator<GetTasksQuery>
{
    public GetTasksQueryValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1.");
        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("PageSize must be between 1 and 100.");
    }
}

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, ApiResponse<PaginatedList<TaskDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTasksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PaginatedList<TaskDto>>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.SourceIssue)
            .Include(t => t.Verifications.OrderByDescending(v => v.AttemptedAt).Take(1))
            .Where(t => t.ProjectId == request.ProjectId);

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var status = request.Status.Trim();
            query = query.Where(t => t.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Priority))
        {
            var priority = request.Priority.Trim();
            query = query.Where(t => t.Priority == priority);
        }

        if (request.AssigneeId.HasValue)
        {
            query = query.Where(t => t.AssigneeId == request.AssigneeId.Value);
        }

        if (request.SourceIssueId.HasValue)
        {
            query = query.Where(t => t.SourceIssueId == request.SourceIssueId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(search) ||
                                     (t.AffectedUrl != null && t.AffectedUrl.ToLower().Contains(search)) ||
                                     (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                SourceIssueId = t.SourceIssueId,
                SourceIssueRuleCode = t.SourceIssue != null ? t.SourceIssue.RuleCode : null,
                SourceIssueSeverity = t.SourceIssue != null ? t.SourceIssue.Severity : null,
                Title = t.Title,
                Description = t.Description,
                AffectedUrl = t.AffectedUrl,
                Priority = t.Priority,
                Status = t.Status,
                AssigneeId = t.AssigneeId,
                AssigneeName = t.Assignee != null ? (t.Assignee.FirstName + " " + t.Assignee.LastName).Trim() : null,
                AssigneeEmail = t.Assignee != null ? t.Assignee.Email : null,
                DueDate = t.DueDate,
                AcceptanceCriteria = t.AcceptanceCriteria,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CreatedBy = t.CreatedBy,
                LatestVerification = t.Verifications
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
                        VerifiedByUserId = v.VerifiedByUserId
                    }).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var paginated = new PaginatedList<TaskDto>(items, totalCount, request.PageNumber, request.PageSize);
        return ApiResponse<PaginatedList<TaskDto>>.Succeeded(paginated);
    }
}
