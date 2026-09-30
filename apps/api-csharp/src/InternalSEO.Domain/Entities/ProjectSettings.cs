namespace InternalSEO.Domain.Entities;

public class ProjectSettings
{
    public Guid ProjectId { get; set; }
    public int CrawlMaxPages { get; set; } = 5000;
    public int CrawlMaxDepth { get; set; } = 10;
    public int CrawlConcurrency { get; set; } = 5;
    public int CrawlRateLimitMs { get; set; } = 200;
    public bool CrawlRespectRobotsTxt { get; set; } = true;
    public string CrawlUserAgent { get; set; } = "InternalSEOPlatformBot/1.0";
    public string RankTrackingFrequency { get; set; } = "Daily";
    public TimeSpan RankTrackingTime { get; set; } = TimeSpan.Zero;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public virtual Project Project { get; set; } = null!;
}
