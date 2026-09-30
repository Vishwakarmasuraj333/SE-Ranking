namespace InternalSEO.Application.Common.Interfaces;

public interface IGa4SyncEnqueuer
{
    string EnqueueSyncJob(Guid projectId);
}
