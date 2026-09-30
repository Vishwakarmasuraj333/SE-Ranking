using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Common.Interfaces;

public interface IGa4SyncRunner
{
    Task<Ga4SyncExecutionResult> ExecuteSyncAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<int> ExecuteAllActiveSyncsAsync(CancellationToken cancellationToken = default);
}
