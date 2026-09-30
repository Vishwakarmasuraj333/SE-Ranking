using InternalSEO.Domain.Constants;

namespace InternalSEO.Domain.Entities;

public class GscQueryMetric
{
    public long Id { get; set; }
    public Guid ProjectId { get; set; }
    public DateOnly MetricDate { get; set; }
    public string QueryText { get; set; } = string.Empty;
    public string PageUrl { get; set; } = string.Empty;
    public string CountryCode { get; set; } = "ALL";
    public string Device { get; set; } = GoogleConstants.Devices.All;
    public int Clicks { get; set; }
    public int Impressions { get; set; }
    public decimal Ctr { get; set; }
    public decimal Position { get; set; }
    public DateTimeOffset SyncedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Project Project { get; set; } = null!;
}
