namespace InternalSEO.Domain.Entities;

public class Ga4LandingPageMetric
{
    public long Id { get; set; }
    public Guid ProjectId { get; set; }
    public string PropertyIdentifier { get; set; } = string.Empty;
    public DateOnly MetricDate { get; set; }
    public string LandingPage { get; set; } = string.Empty;
    public int Sessions { get; set; }
    public int ActiveUsers { get; set; }
    public decimal EngagementRate { get; set; }
    public int Conversions { get; set; }
    public decimal Revenue { get; set; }
    public DateTimeOffset SyncedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Project Project { get; set; } = null!;
}
