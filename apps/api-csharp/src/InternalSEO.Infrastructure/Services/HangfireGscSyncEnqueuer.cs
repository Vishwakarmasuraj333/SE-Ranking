using Hangfire;
using InternalSEO.Application.Common.Interfaces;

namespace InternalSEO.Infrastructure.Services;

public class HangfireGscSyncEnqueuer : IGscSyncEnqueuer
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public HangfireGscSyncEnqueuer(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public string EnqueueSyncJob(Guid projectId)
    {
        return _backgroundJobClient.Enqueue<IGscSyncRunner>(runner => runner.ExecuteSyncAsync(projectId, CancellationToken.None));
    }
}
