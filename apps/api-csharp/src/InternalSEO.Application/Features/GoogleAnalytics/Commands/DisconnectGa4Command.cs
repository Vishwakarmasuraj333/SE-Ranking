using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Commands;

public record DisconnectGa4Command(Guid ProjectId) : IRequest<ApiResponse<bool>>;

public class DisconnectGa4CommandHandler : IRequestHandler<DisconnectGa4Command, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DisconnectGa4CommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<bool>> Handle(DisconnectGa4Command request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<bool>.Failed("No Google Analytics 4 connection found for this project.");
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
            payload: new { AccountEmail = accountEmail, ServiceType = GoogleConstants.ServiceTypes.Ga4 },
            cancellationToken: cancellationToken
        );

        return ApiResponse<bool>.Succeeded(true);
    }
}
