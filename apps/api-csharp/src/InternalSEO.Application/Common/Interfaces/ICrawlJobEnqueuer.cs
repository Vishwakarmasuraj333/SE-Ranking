namespace InternalSEO.Application.Common.Interfaces;

public interface ICrawlJobEnqueuer
{
    string EnqueueCrawlJob(Guid crawlRunId);
}
