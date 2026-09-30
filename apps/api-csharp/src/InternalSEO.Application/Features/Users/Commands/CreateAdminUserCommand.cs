using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Commands;

public record CreateAdminUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Role,
    string? PhoneNumber = null
) : IRequest<AdminUserDto>;

public class CreateAdminUserCommandValidator : AbstractValidator<CreateAdminUserCommand>
{
    public CreateAdminUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty().Must(r => SystemRoles.All.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", SystemRoles.All)}");
    }
}

public class CreateAdminUserCommandHandler : IRequestHandler<CreateAdminUserCommand, AdminUserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public CreateAdminUserCommandHandler(
        IApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<AdminUserDto> Handle(CreateAdminUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var emailExists = await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure("Email", "A user with this email address already exists.")
            });
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role, cancellationToken);
        if (role == null)
        {
            throw new NotFoundException(nameof(Role), request.Role);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim().ToLowerInvariant(),
            NormalizedEmail = normalizedEmail,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = _currentUser.UserId
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);

        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedBy = _currentUser.UserId
        };

        _context.UserRoles.Add(userRole);

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "User.Created",
            entityType: "User",
            entityId: user.Id.ToString(),
            projectId: null,
            payload: new { user.Email, user.FirstName, user.LastName, Role = role.Name },
            cancellationToken: cancellationToken);

        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = role.Name,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            ProjectCount = 0
        };
    }
}
