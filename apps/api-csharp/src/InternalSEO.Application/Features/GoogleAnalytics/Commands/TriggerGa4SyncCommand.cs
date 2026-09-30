using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Commands;

public record TriggerGa4SyncCommand(Guid ProjectId) : IRequest<ApiResponse<string>>;

public class TriggerGa4SyncCommandHandler : IRequestHandler<TriggerGa4SyncCommand, ApiResponse<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGa4SyncEnqueuer _syncEnqueuer;

    public TriggerGa4SyncCommandHandler(IApplicationDbContext context, IGa4SyncEnqueuer syncEnqueuer)
    {
        _context = context;
        _syncEnqueuer = syncEnqueuer;
    }

    public async Task<ApiResponse<string>> Handle(TriggerGa4SyncCommand request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<string>.Failed("No Google Analytics 4 connection found. Please connect your account in Settings.");
        }

        if (string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            return ApiResponse<string>.Failed("No GA4 property is bound to this project. Please select a property first.");
        }

        var jobId = _syncEnqueuer.EnqueueSyncJob(request.ProjectId);
        return ApiResponse<string>.Succeeded(jobId, "Synchronization job enqueued.");
    }
}
