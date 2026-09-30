using Hangfire;
using InternalSEO.Application.Common.Interfaces;

namespace InternalSEO.Infrastructure.Services;

public class HangfireCrawlJobEnqueuer : ICrawlJobEnqueuer
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public HangfireCrawlJobEnqueuer(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public string EnqueueCrawlJob(Guid crawlRunId)
    {
        return _backgroundJobClient.Enqueue<ICrawlJobRunner>(runner => runner.ExecuteCrawlAsync(crawlRunId, CancellationToken.None));
    }
}
