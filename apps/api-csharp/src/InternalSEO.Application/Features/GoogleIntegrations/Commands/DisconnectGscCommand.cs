using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Commands;

public record DisconnectGscCommand(Guid ProjectId) : IRequest<ApiResponse<bool>>;

public class DisconnectGscCommandHandler : IRequestHandler<DisconnectGscCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DisconnectGscCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<bool>> Handle(DisconnectGscCommand request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<bool>.Failed("No Google connection found for this project.");
        }

        var accountEmail = connection.AccountEmail;
        var connectionId = connection.Id.ToString();

        _context.GoogleConnections.Remove(connection);
        await _context.SaveChangesAsync(cancellationToken);

        // Safe activity log
        await _activityLogger.LogAsync(
            actionType: "GoogleConnection.Disconnected",
            entityType: "GoogleConnection",
            entityId: connectionId,
            projectId: request.ProjectId,
            payload: new { AccountEmail = accountEmail },
            cancellationToken: cancellationToken
        );

        return ApiResponse<bool>.Succeeded(true);
    }
}
