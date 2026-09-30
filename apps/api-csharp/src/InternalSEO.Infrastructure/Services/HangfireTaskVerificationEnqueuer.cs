using Hangfire;
using InternalSEO.Application.Common.Interfaces;

namespace InternalSEO.Infrastructure.Services;

public class HangfireTaskVerificationEnqueuer : ITaskVerificationEnqueuer
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public HangfireTaskVerificationEnqueuer(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public void EnqueueVerificationJob(long taskVerificationId)
    {
        _backgroundJobClient.Enqueue<ITaskVerificationRunner>(
            runner => runner.ExecuteVerificationAsync(taskVerificationId, CancellationToken.None));
    }
}
