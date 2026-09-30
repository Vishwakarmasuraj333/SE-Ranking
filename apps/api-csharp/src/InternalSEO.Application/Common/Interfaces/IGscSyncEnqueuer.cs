namespace InternalSEO.Application.Common.Interfaces;

public interface IGscSyncEnqueuer
{
    string EnqueueSyncJob(Guid projectId);
}
