using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Notifications.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(
    int Page = 1,
    int PageSize = 20,
    bool? UnreadOnly = null,
    Guid? ProjectId = null
) : IRequest<ApiResponse<PaginatedList<NotificationDto>>>;

public class GetNotificationsQueryValidator : AbstractValidator<GetNotificationsQuery>
{
    public GetNotificationsQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");
        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");
    }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, ApiResponse<PaginatedList<NotificationDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetNotificationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<PaginatedList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        // Server-side authorization & multi-tenant isolation:
        // Current user can only view their own direct notifications or notifications in projects they belong to.
        // With per-user materialized notifications, all notifications created for the user have UserId == currentUserId.
        // We also check ProjectMembers to strictly prevent leakage if an unassigned row exists.
        var userProjectIds = await _context.ProjectMembers
            .Where(pm => pm.UserId == currentUserId.Value)
            .Select(pm => pm.ProjectId)
            .ToListAsync(cancellationToken);

        // SuperAdmin can see their own notifications or any in projects they are member of (or system broadcasts)
        var query = _context.Notifications
            .AsNoTracking()
            .Include(n => n.Project)
            .Where(n => n.UserId == currentUserId.Value);

        if (request.ProjectId.HasValue)
        {
            // If filtering by specific project, verify project access unless SuperAdmin
            if (!_currentUserService.IsSuperAdmin && !userProjectIds.Contains(request.ProjectId.Value))
            {
                throw new ForbiddenException("You are not authorized to view notifications for this project.");
            }

            query = query.Where(n => n.ProjectId == request.ProjectId.Value);
        }

        if (request.UnreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                ProjectId = n.ProjectId,
                ProjectName = n.Project.Name,
                Title = n.Title,
                Message = n.Message,
                Severity = n.Severity,
                EventType = n.EventType,
                TargetUrl = n.TargetUrl,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var paginated = new PaginatedList<NotificationDto>(
            items,
            totalCount,
            request.Page,
            request.PageSize);

        return ApiResponse<PaginatedList<NotificationDto>>.Succeeded(paginated);
    }
}
