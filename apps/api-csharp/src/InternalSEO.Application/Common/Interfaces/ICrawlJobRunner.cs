namespace InternalSEO.Application.Common.Interfaces;

public interface ICrawlJobRunner
{
    Task ExecuteCrawlAsync(Guid crawlRunId, CancellationToken cancellationToken);
}
