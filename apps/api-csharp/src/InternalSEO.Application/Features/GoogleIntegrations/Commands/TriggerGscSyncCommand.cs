using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Commands;

public record TriggerGscSyncCommand(Guid ProjectId) : IRequest<ApiResponse<string>>;

public class TriggerGscSyncCommandHandler : IRequestHandler<TriggerGscSyncCommand, ApiResponse<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGscSyncEnqueuer _syncEnqueuer;

    public TriggerGscSyncCommandHandler(IApplicationDbContext context, IGscSyncEnqueuer syncEnqueuer)
    {
        _context = context;
        _syncEnqueuer = syncEnqueuer;
    }

    public async Task<ApiResponse<string>> Handle(TriggerGscSyncCommand request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<string>.Failed("No Google connection found. Please connect your account in Settings.");
        }

        if (string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            return ApiResponse<string>.Failed("No GSC property is bound to this project. Please select a property first.");
        }

        var jobId = _syncEnqueuer.EnqueueSyncJob(request.ProjectId);
        return ApiResponse<string>.Succeeded(jobId, "Synchronization job enqueued.");
    }
}
