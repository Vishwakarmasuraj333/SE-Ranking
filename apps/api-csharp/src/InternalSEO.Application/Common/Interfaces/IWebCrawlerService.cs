namespace InternalSEO.Application.Common.Interfaces;

public class CrawlPageResult
{
    public string Url { get; set; } = string.Empty;
    public string UrlHash { get; set; } = string.Empty;
    public int HttpStatusCode { get; set; }
    public string? ContentType { get; set; }
    public long? ContentLengthBytes { get; set; }
    public int? LoadTimeMs { get; set; }
    public int CrawlDepth { get; set; }
    public string? Title { get; set; }
    public int? TitleLength { get; set; }
    public string? MetaDescription { get; set; }
    public string? H1 { get; set; }
    public int H1Count { get; set; }
    public string? CanonicalUrl { get; set; }
    public bool IsIndexable { get; set; } = true;
    public string? IndexabilityStatus { get; set; }
    public int InlinksCount { get; set; }
    public int OutlinksCount { get; set; }
    public List<string> OutgoingInternalLinks { get; set; } = new();
    public string? RawHeadSnippet { get; set; }
}

public interface IWebCrawlerService
{
    Task<List<CrawlPageResult>> CrawlWebsiteAsync(
        Uri startUrl,
        string primaryDomain,
        int maxPages,
        int maxDepth,
        int rateLimitMs,
        string userAgent,
        Func<int, int, Task>? onProgressAsync = null,
        CancellationToken cancellationToken = default);
}
