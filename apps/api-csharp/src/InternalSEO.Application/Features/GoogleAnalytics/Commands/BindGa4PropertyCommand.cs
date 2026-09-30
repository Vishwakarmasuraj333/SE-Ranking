using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Commands;

public record BindGa4PropertyCommand(
    Guid ProjectId,
    string PropertyIdentifier
) : IRequest<ApiResponse<Ga4ConnectionDto>>;

public class BindGa4PropertyCommandValidator : AbstractValidator<BindGa4PropertyCommand>
{
    public BindGa4PropertyCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.PropertyIdentifier).NotEmpty().WithMessage("GA4 Property Identifier is required.")
            .MaximumLength(255).WithMessage("Property Identifier cannot exceed 255 characters.");
    }
}

public class BindGa4PropertyCommandHandler : IRequestHandler<BindGa4PropertyCommand, ApiResponse<Ga4ConnectionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGa4SyncEnqueuer _syncEnqueuer;
    private readonly IActivityLogger _activityLogger;

    public BindGa4PropertyCommandHandler(
        IApplicationDbContext context,
        IGa4SyncEnqueuer syncEnqueuer,
        IActivityLogger activityLogger)
    {
        _context = context;
        _syncEnqueuer = syncEnqueuer;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<Ga4ConnectionDto>> Handle(BindGa4PropertyCommand request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<Ga4ConnectionDto>.Failed("No Google connection found. Please connect your Google account first.");
        }

        connection.PropertyIdentifier = request.PropertyIdentifier.Trim();
        connection.SyncStatus = GoogleConstants.SyncStatuses.Active;
        connection.LastErrorMessage = null;
        connection.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Safe activity log
        await _activityLogger.LogAsync(
            actionType: "GoogleConnection.Bound",
            entityType: "GoogleConnection",
            entityId: connection.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { PropertyIdentifier = connection.PropertyIdentifier, ServiceType = GoogleConstants.ServiceTypes.Ga4 },
            cancellationToken: cancellationToken
        );

        // Queue initial sync
        try
        {
            _syncEnqueuer.EnqueueSyncJob(request.ProjectId);
        }
        catch
        {
            // Non-blocking if scheduler is temporarily busy
        }

        var dto = new Ga4ConnectionDto(
            connection.Id,
            connection.ProjectId,
            connection.ServiceType,
            connection.PropertyIdentifier,
            connection.AccountEmail,
            connection.SyncStatus,
            connection.LastSyncedAt,
            connection.LastErrorMessage,
            connection.CreatedAt,
            connection.UpdatedAt
        );

        return ApiResponse<Ga4ConnectionDto>.Succeeded(dto);
    }
}
