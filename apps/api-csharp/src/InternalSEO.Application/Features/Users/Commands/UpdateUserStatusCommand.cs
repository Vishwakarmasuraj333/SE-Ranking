using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Commands;

public record UpdateUserStatusCommand(Guid UserId, bool IsActive) : IRequest<AdminUserDto>;

public class UpdateUserStatusCommandValidator : AbstractValidator<UpdateUserStatusCommand>
{
    public UpdateUserStatusCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, AdminUserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserStatusCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<AdminUserDto> Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.UserId);
        }

        // Prevent Super Admin from deactivating own account
        if (!request.IsActive && _currentUser.UserId == user.Id)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure("IsActive", "Super Administrators cannot deactivate their own account.")
            });
        }

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = _currentUser.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "User.StatusChanged",
            entityType: "User",
            entityId: user.Id.ToString(),
            projectId: null,
            payload: new { user.Email, IsActive = user.IsActive },
            cancellationToken: cancellationToken);

        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user.UserRoles.FirstOrDefault()?.Role.Name ?? string.Empty,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            ProjectCount = user.ProjectMemberships.Count
        };
    }
}
