using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Auth.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponseDto>;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(v => v.RefreshToken).NotEmpty().WithMessage("Refresh token is required.");
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken);

        if (user == null || !user.IsActive || user.RefreshTokenExpiryTime <= DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        var primaryRole = user.UserRoles.FirstOrDefault()?.Role.Name ?? SystemRoles.Viewer;
        var newAccessToken = _tokenService.GenerateAccessToken(user, primaryRole);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTimeOffset.UtcNow.AddDays(_tokenService.GetRefreshTokenExpiryDays());

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
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
