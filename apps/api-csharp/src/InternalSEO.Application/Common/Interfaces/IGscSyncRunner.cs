using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Common.Interfaces;

public interface IGscSyncRunner
{
    Task<GscSyncExecutionResult> ExecuteSyncAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<int> ExecuteAllActiveSyncsAsync(CancellationToken cancellationToken = default);
}
