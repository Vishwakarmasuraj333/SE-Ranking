using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Commands;

public record BindGscPropertyCommand(
    Guid ProjectId,
    string PropertyIdentifier
) : IRequest<ApiResponse<GscConnectionDto>>;

public class BindGscPropertyCommandValidator : AbstractValidator<BindGscPropertyCommand>
{
    public BindGscPropertyCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty().WithMessage("Project ID is required.");
        RuleFor(x => x.PropertyIdentifier).NotEmpty().WithMessage("GSC Property Identifier is required.")
            .MaximumLength(255).WithMessage("Property Identifier cannot exceed 255 characters.");
    }
}

public class BindGscPropertyCommandHandler : IRequestHandler<BindGscPropertyCommand, ApiResponse<GscConnectionDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGscSyncEnqueuer _syncEnqueuer;
    private readonly IActivityLogger _activityLogger;

    public BindGscPropertyCommandHandler(
        IApplicationDbContext context,
        IGscSyncEnqueuer syncEnqueuer,
        IActivityLogger activityLogger)
    {
        _context = context;
        _syncEnqueuer = syncEnqueuer;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<GscConnectionDto>> Handle(BindGscPropertyCommand request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<GscConnectionDto>.Failed("No Google connection found. Please connect your Google account first.");
        }

        connection.PropertyIdentifier = request.PropertyIdentifier.Trim();
        connection.SyncStatus = GoogleConstants.SyncStatuses.Active;
        connection.LastErrorMessage = null;
        connection.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Safe activity log
        await _activityLogger.LogAsync(
            actionType: "GoogleConnection.PropertyBound",
            entityType: "GoogleConnection",
            entityId: connection.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { PropertyIdentifier = connection.PropertyIdentifier },
            cancellationToken: cancellationToken
        );

        // Enqueue initial synchronization
        try
        {
            _syncEnqueuer.EnqueueSyncJob(request.ProjectId);
        }
        catch
        {
            // Ignore queueing failure in tests/offline
        }

        var dto = new GscConnectionDto(
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

        return ApiResponse<GscConnectionDto>.Succeeded(dto);
    }
}
