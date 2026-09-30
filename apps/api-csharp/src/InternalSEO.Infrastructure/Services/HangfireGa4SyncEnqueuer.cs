using Hangfire;
using InternalSEO.Application.Common.Interfaces;

namespace InternalSEO.Infrastructure.Services;

public class HangfireGa4SyncEnqueuer : IGa4SyncEnqueuer
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public HangfireGa4SyncEnqueuer(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public string EnqueueSyncJob(Guid projectId)
    {
        return _backgroundJobClient.Enqueue<IGa4SyncRunner>(runner => runner.ExecuteSyncAsync(projectId, CancellationToken.None));
    }
}
