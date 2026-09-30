namespace InternalSEO.Application.Common.Models;

public record GoogleTokenExchangeResult(
    string AccessToken,
    string RefreshToken,
    int ExpiresInSeconds,
    string AccountEmail,
    string Scope
);

public record GoogleTokenRefreshResult(
    string AccessToken,
    int ExpiresInSeconds
);

public record GscProperty(
    string PropertyIdentifier,
    string PermissionLevel,
    string? SiteUrl
);

public record GscDailyMetricRecord(
    DateOnly MetricDate,
    string Device,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal AveragePosition
);

public record GscQueryMetricRecord(
    DateOnly MetricDate,
    string QueryText,
    string PageUrl,
    string CountryCode,
    string Device,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal Position
);

public record GscFetchDataResult(
    bool Success,
    string? ErrorMessage,
    IReadOnlyList<GscDailyMetricRecord> DailyMetrics,
    IReadOnlyList<GscQueryMetricRecord> QueryMetrics,
    System.Net.HttpStatusCode? StatusCode = null,
    bool IsAuthenticationFailure = false
);

public record GscSyncExecutionResult(
    bool Success,
    string? ErrorMessage,
    int DaysProcessed,
    int TotalDailyRecords,
    int TotalQueryRecords
);

public record Ga4Property(
    string PropertyIdentifier,
    string DisplayName,
    string? AccountName
);

public record Ga4DailyMetricRecord(
    DateOnly MetricDate,
    int Sessions,
    int ActiveUsers,
    decimal EngagementRate,
    int Conversions,
    decimal Revenue
);

public record Ga4LandingPageMetricRecord(
    DateOnly MetricDate,
    string LandingPage,
    int Sessions,
    int ActiveUsers,
    decimal EngagementRate,
    int Conversions,
    decimal Revenue
);

public record Ga4FetchDataResult(
    bool Success,
    string? ErrorMessage,
    IReadOnlyList<Ga4DailyMetricRecord> DailyMetrics,
    IReadOnlyList<Ga4LandingPageMetricRecord> LandingPageMetrics,
    System.Net.HttpStatusCode? StatusCode = null,
    bool IsAuthenticationFailure = false
);

public record Ga4SyncExecutionResult(
    bool Success,
    string? ErrorMessage,
    int DaysProcessed,
    int TotalDailyRecords,
    int TotalLandingPageRecords
);

