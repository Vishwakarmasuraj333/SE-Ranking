namespace InternalSEO.Domain.Entities;

public class CrawlPage
{
    public long Id { get; set; }
    public Guid CrawlRunId { get; set; }
    public Guid ProjectId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string UrlHash { get; set; } = string.Empty; // SHA-256 of normalized URL
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
    public string? IndexabilityStatus { get; set; } // 'Indexable', 'Noindex', 'BlockedByRobots', 'Canonicalized'
    public int InlinksCount { get; set; }
    public int OutlinksCount { get; set; }
    public DateTimeOffset CrawledAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual CrawlRun CrawlRun { get; set; } = null!;
    public virtual Project Project { get; set; } = null!;
}
