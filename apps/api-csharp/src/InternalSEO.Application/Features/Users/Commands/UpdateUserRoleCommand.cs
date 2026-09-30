using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Commands;

public record UpdateUserRoleCommand(Guid UserId, string Role) : IRequest<AdminUserDto>;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Role).NotEmpty().Must(r => SystemRoles.All.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", SystemRoles.All)}");
    }
}

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, AdminUserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserRoleCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<AdminUserDto> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
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

        var newRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role, cancellationToken);
        if (newRole == null)
        {
            throw new NotFoundException(nameof(Role), request.Role);
        }

        var oldRole = user.UserRoles.FirstOrDefault()?.Role.Name ?? "None";

        // Remove existing role assignments
        _context.UserRoles.RemoveRange(user.UserRoles);

        // Add new role assignment
        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = newRole.Id,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedBy = _currentUser.UserId
        };
        _context.UserRoles.Add(userRole);

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "User.RoleChanged",
            entityType: "User",
            entityId: user.Id.ToString(),
            projectId: null,
            payload: new { user.Email, OldRole = oldRole, NewRole = newRole.Name },
            cancellationToken: cancellationToken);

        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = newRole.Name,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            ProjectCount = user.ProjectMemberships.Count
        };
    }
}
