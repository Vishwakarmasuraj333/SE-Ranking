using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Notifications.Commands.MarkAllRead;

public record MarkAllNotificationsReadCommand(Guid? ProjectId = null) : IRequest<ApiResponse<int>>;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, ApiResponse<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public MarkAllNotificationsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<int>> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        // Multi-tenant isolation: strictly mutate only notifications owned by current user
        var query = _context.Notifications
            .Where(n => n.UserId == currentUserId.Value && !n.IsRead);

        if (request.ProjectId.HasValue)
        {
            query = query.Where(n => n.ProjectId == request.ProjectId.Value);
        }

        var unreadNotifications = await query.ToListAsync(cancellationToken);
        if (unreadNotifications.Count == 0)
        {
            return ApiResponse<int>.Succeeded(0, "No unread notifications to mark as read.");
        }

        var now = DateTimeOffset.UtcNow;
        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<int>.Succeeded(unreadNotifications.Count, $"{unreadNotifications.Count} notification(s) marked as read.");
    }
}
