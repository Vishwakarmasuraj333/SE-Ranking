using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Auth.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IActivityLogger _activityLogger;

    public LoginCommandHandler(
        IApplicationDbContext _context,
        IPasswordHasherService passwordHasher,
        ITokenService tokenService,
        IActivityLogger activityLogger)
    {
        this._context = _context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _activityLogger = activityLogger;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedException($"Account is temporarily locked until {user.LockoutEnd.Value:u} due to multiple failed login attempts.");
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(user, request.Password, user.PasswordHash);

        if (!isPasswordValid)
        {
            user.AccessFailedCount++;
            if (user.AccessFailedCount >= 5)
            {
                user.LockoutEnd = DateTimeOffset.UtcNow.AddMinutes(15);
            }
            await _context.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedException("Invalid email or password.");
        }

        // Reset failed count and record login
        user.AccessFailedCount = 0;
        user.LockoutEnd = null;
        user.LastLoginAt = DateTimeOffset.UtcNow;

        var primaryRole = user.UserRoles.FirstOrDefault()?.Role.Name ?? SystemRoles.Viewer;

        var accessToken = _tokenService.GenerateAccessToken(user, primaryRole);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTimeOffset.UtcNow.AddDays(_tokenService.GetRefreshTokenExpiryDays());

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshTokenExpiry;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Auth.Login",
            entityType: "User",
            entityId: user.Id.ToString(),
            payload: new { user.Email, Role = primaryRole },
            actorId: user.Id,
            actorEmail: user.Email,
            actorRole: primaryRole,
            cancellationToken: cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(15),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = primaryRole,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                AssignedProjectIds = user.ProjectMemberships.Select(pm => pm.ProjectId).ToList()
            }
        };
    }
}
