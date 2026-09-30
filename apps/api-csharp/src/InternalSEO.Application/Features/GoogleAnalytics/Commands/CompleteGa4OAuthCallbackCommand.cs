using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Commands;

public record CompleteGa4OAuthCallbackCommand(
    Guid ProjectId,
    string Code,
    string RedirectUri,
    string State
) : IRequest<ApiResponse<Ga4ConnectionDto>>;

public class CompleteGa4OAuthCallbackCommandValidator : AbstractValidator<CompleteGa4OAuthCallbackCommand>
{
    public CompleteGa4OAuthCallbackCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.Code).NotEmpty().WithMessage("Authorization code is required.");
        RuleFor(x => x.RedirectUri).NotEmpty().WithMessage("Redirect URI is required.");
        RuleFor(x => x.State).NotEmpty().WithMessage("OAuth state is required.");
    }
}

public class CompleteGa4OAuthCallbackCommandHandler : IRequestHandler<CompleteGa4OAuthCallbackCommand, ApiResponse<Ga4ConnectionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAuthService _authService;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IOAuthNonceService _oauthNonceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogger _activityLogger;

    public CompleteGa4OAuthCallbackCommandHandler(
        IApplicationDbContext context,
        IGoogleAuthService authService,
        ITokenEncryptionService encryptionService,
        IOAuthNonceService oauthNonceService,
        ICurrentUserService currentUserService,
        IActivityLogger activityLogger)
    {
        _context = context;
        _authService = authService;
        _encryptionService = encryptionService;
        _oauthNonceService = oauthNonceService;
        _currentUserService = currentUserService;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<Ga4ConnectionDto>> Handle(CompleteGa4OAuthCallbackCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Ga4ConnectionDto>.Failed("Project not found.");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value == Guid.Empty)
        {
            return ApiResponse<Ga4ConnectionDto>.Failed("User is not authenticated.");
        }

        // 1. Validate state and perform atomic one-time consumption
        var nonceValidation = await _oauthNonceService.ValidateAndConsumeNonceAsync(
            request.State,
            request.ProjectId,
            userId.Value,
            GoogleConstants.ServiceTypes.Ga4,
            cancellationToken);

        if (!nonceValidation.Success)
        {
            return ApiResponse<Ga4ConnectionDto>.Failed(nonceValidation.ErrorMessage ?? "Invalid or replayed OAuth state parameter.");
        }

        // 2. ONLY after successful state validation + atomic consumption, exchange code with Google
        var tokenResult = await _authService.ExchangeAuthorizationCodeAsync(request.Code, request.RedirectUri, cancellationToken);
        if (tokenResult == null || string.IsNullOrEmpty(tokenResult.RefreshToken))
        {
            return ApiResponse<Ga4ConnectionDto>.Failed("Failed to obtain refresh token from Google OAuth provider.");
        }

        var encryptedRefreshToken = _encryptionService.Encrypt(tokenResult.RefreshToken);
        var tokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(tokenResult.ExpiresInSeconds);

        var existingConnection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

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
                ServiceType = GoogleConstants.ServiceTypes.Ga4,
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
            payload: new { AccountEmail = tokenResult.AccountEmail, ServiceType = GoogleConstants.ServiceTypes.Ga4 },
            cancellationToken: cancellationToken
        );

        var dto = new Ga4ConnectionDto(
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

        return ApiResponse<Ga4ConnectionDto>.Succeeded(dto);
    }
}
