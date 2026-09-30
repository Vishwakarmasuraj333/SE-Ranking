namespace InternalSEO.Application.Common.Interfaces;

public interface ITaskVerificationEnqueuer
{
    void EnqueueVerificationJob(long taskVerificationId);
}
