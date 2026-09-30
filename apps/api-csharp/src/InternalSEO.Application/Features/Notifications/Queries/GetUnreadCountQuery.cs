using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Notifications.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Notifications.Queries;

public record GetUnreadCountQuery : IRequest<ApiResponse<UnreadCountDto>>;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, ApiResponse<UnreadCountDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUnreadCountQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<UnreadCountDto>> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var unreadCount = await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == currentUserId.Value && !n.IsRead)
            .CountAsync(cancellationToken);

        return ApiResponse<UnreadCountDto>.Succeeded(new UnreadCountDto { Count = unreadCount });
    }
}
