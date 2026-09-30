using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Notifications.Commands.MarkRead;

public record MarkNotificationReadCommand(long Id) : IRequest<ApiResponse<bool>>;

public class MarkNotificationReadCommandValidator : AbstractValidator<MarkNotificationReadCommand>
{
    public MarkNotificationReadCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Notification ID must be a positive integer.");
    }
}

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public MarkNotificationReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<bool>> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedException("User is not authenticated.");
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (notification == null)
        {
            throw new NotFoundException($"Notification with ID {request.Id} was not found.");
        }

        // IDOR Protection: User can only mark read their own notification
        if (notification.UserId != currentUserId.Value && !_currentUserService.IsSuperAdmin)
        {
            throw new ForbiddenException("You are not authorized to modify this notification.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<bool>.Succeeded(true, "Notification marked as read.");
    }
}
