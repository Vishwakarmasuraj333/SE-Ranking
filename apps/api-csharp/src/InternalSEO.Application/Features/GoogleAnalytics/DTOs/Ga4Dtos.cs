namespace InternalSEO.Application.Features.GoogleAnalytics.DTOs;

public record Ga4ConnectionDto(
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

public record Ga4PropertyDto(
    string PropertyIdentifier,
    string DisplayName,
    string? AccountName
);

public record Ga4AuthUrlDto(
    string AuthUrl,
    string State
);

public record Ga4DailyPointDto(
    DateOnly Date,
    int Sessions,
    int ActiveUsers,
    decimal EngagementRate,
    int Conversions,
    decimal Revenue
);

public record Ga4OverviewDto(
    int TotalSessions,
    int TotalActiveUsers,
    decimal AverageEngagementRate,
    int TotalConversions,
    decimal TotalRevenue,
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<Ga4DailyPointDto> DailySeries,
    DateTimeOffset? LastSyncedAt,
    string SyncStatus,
    string PropertyIdentifier
);

public record Ga4PageRowDto(
    string LandingPage,
    int Sessions,
    int ActiveUsers,
    decimal EngagementRate,
    int Conversions,
    decimal Revenue
);
