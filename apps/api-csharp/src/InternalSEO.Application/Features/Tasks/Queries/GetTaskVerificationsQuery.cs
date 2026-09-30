using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Tasks.Queries;

public record GetTaskVerificationsQuery(Guid ProjectId, Guid TaskId) : IRequest<ApiResponse<List<TaskVerificationDto>>>;

public class GetTaskVerificationsQueryValidator : AbstractValidator<GetTaskVerificationsQuery>
{
    public GetTaskVerificationsQueryValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
    }
}

public class GetTaskVerificationsQueryHandler : IRequestHandler<GetTaskVerificationsQuery, ApiResponse<List<TaskVerificationDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTaskVerificationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<TaskVerificationDto>>> Handle(GetTaskVerificationsQuery request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.ProjectId == request.ProjectId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException($"Task with ID '{request.TaskId}' was not found in this project.");
        }

        var verifications = await _context.TaskVerifications
            .Include(v => v.VerifiedByUser)
            .Where(v => v.TaskId == request.TaskId)
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
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<TaskVerificationDto>>.Succeeded(verifications);
    }
}
