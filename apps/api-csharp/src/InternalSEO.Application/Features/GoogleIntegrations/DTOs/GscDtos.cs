namespace InternalSEO.Application.Features.GoogleIntegrations.DTOs;

public record GscConnectionDto(
    Guid Id,
    Guid ProjectId,
    string ServiceType,
    string PropertyIdentifier,
    string AccountEmail,
    string SyncStatus,
    DateTimeOffset? LastSyncedAt,
    string? LastErrorMessage,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record GscPropertyDto(
    string PropertyIdentifier,
    string PermissionLevel,
    string? SiteUrl
);

public record GscDailyPointDto(
    DateOnly Date,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal AveragePosition
);

public record GscDeviceStatDto(
    string Device,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal AveragePosition,
    decimal ClickShare
);

public record GscCountryStatDto(
    string CountryCode,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal AveragePosition,
    decimal ClickShare
);

public record GscPerformanceOverviewDto(
    int TotalClicks,
    int TotalImpressions,
    decimal AverageCtr,
    decimal AveragePosition,
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<GscDailyPointDto> DailySeries,
    IReadOnlyList<GscDeviceStatDto> DeviceBreakdown,
    DateTimeOffset? LastSyncedAt,
    string SyncStatus
);

public record GscQueryRowDto(
    string QueryText,
    string PageUrl,
    string CountryCode,
    string Device,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal Position
);

public record GscPageRowDto(
    string PageUrl,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal AveragePosition,
    int QueryCount
);

public record GscQueryDailyPointDto(
    DateOnly Date,
    int Clicks,
    int Impressions,
    decimal Ctr,
    decimal Position
);

public record GscQueryDetailDto(
    string QueryText,
    int TotalClicks,
    int TotalImpressions,
    decimal AverageCtr,
    decimal AveragePosition,
    IReadOnlyList<string> TopPages,
    IReadOnlyList<GscQueryDailyPointDto> History
);

public record GscAuthUrlDto(
    string AuthUrl,
    string State
);
