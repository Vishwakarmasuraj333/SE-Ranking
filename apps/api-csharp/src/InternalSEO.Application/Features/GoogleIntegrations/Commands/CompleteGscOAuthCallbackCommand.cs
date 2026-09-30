using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Commands;

public record CompleteGscOAuthCallbackCommand(
    Guid ProjectId,
    string Code,
    string RedirectUri,
    string? State
) : IRequest<ApiResponse<GscConnectionDto>>;

public class CompleteGscOAuthCallbackCommandValidator : AbstractValidator<CompleteGscOAuthCallbackCommand>
{
    public CompleteGscOAuthCallbackCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.Code).NotEmpty().WithMessage("Authorization code is required.");
        RuleFor(x => x.RedirectUri).NotEmpty().WithMessage("Redirect URI is required.");
    }
}

public class CompleteGscOAuthCallbackCommandHandler : IRequestHandler<CompleteGscOAuthCallbackCommand, ApiResponse<GscConnectionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAuthService _authService;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IActivityLogger _activityLogger;

    public CompleteGscOAuthCallbackCommandHandler(
        IApplicationDbContext context,
        IGoogleAuthService authService,
        ITokenEncryptionService encryptionService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _authService = authService;
        _encryptionService = encryptionService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<GscConnectionDto>> Handle(CompleteGscOAuthCallbackCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<GscConnectionDto>.Failed("Project not found.");
        }

        var tokenResult = await _authService.ExchangeAuthorizationCodeAsync(request.Code, request.RedirectUri, cancellationToken);
        if (tokenResult == null || string.IsNullOrEmpty(tokenResult.RefreshToken))
        {
            return ApiResponse<GscConnectionDto>.Failed("Failed to obtain refresh token from Google OAuth provider.");
        }

        var encryptedRefreshToken = _encryptionService.Encrypt(tokenResult.RefreshToken);
        var tokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(tokenResult.ExpiresInSeconds);

        var existingConnection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (existingConnection != null)
        {
            existingConnection.AccountEmail = tokenResult.AccountEmail;
            existingConnection.EncryptedRefreshToken = encryptedRefreshToken;
            existingConnection.TokenExpiresAt = tokenExpiresAt;
            existingConnection.SyncStatus = GoogleConstants.SyncStatuses.Active;
            existingConnection.LastErrorMessage = null;
            existingConnection.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            existingConnection = new GoogleConnection
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                ServiceType = GoogleConstants.ServiceTypes.Gsc,
                PropertyIdentifier = string.Empty,
                AccountEmail = tokenResult.AccountEmail,
                EncryptedRefreshToken = encryptedRefreshToken,
                TokenExpiresAt = tokenExpiresAt,
                SyncStatus = GoogleConstants.SyncStatuses.Active,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _context.GoogleConnections.Add(existingConnection);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Safe activity log - NO tokens, codes, or secrets
        await _activityLogger.LogAsync(
            actionType: "GoogleConnection.Connected",
            entityType: "GoogleConnection",
            entityId: existingConnection.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { AccountEmail = tokenResult.AccountEmail, ServiceType = GoogleConstants.ServiceTypes.Gsc },
            cancellationToken: cancellationToken
        );

        var dto = new GscConnectionDto(
            existingConnection.Id,
            existingConnection.ProjectId,
            existingConnection.ServiceType,
            existingConnection.PropertyIdentifier,
            existingConnection.AccountEmail,
            existingConnection.SyncStatus,
            existingConnection.LastSyncedAt,
            existingConnection.LastErrorMessage,
            existingConnection.CreatedAt,
            existingConnection.UpdatedAt
        );

        return ApiResponse<GscConnectionDto>.Succeeded(dto);
    }
}
