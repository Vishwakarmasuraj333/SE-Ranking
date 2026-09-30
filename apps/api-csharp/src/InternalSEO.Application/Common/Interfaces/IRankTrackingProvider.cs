namespace InternalSEO.Application.Common.Interfaces;

public record RankObservation(
    Guid KeywordId,
    Guid ProjectId,
    DateOnly CheckDate,
    int? Position,
    int? PreviousPosition,
    int? PositionChange,
    string? RankedUrl,
    bool IsTargetUrlMatched,
    bool IsCannibalized,
    string? SerpFeatures,
    string ProviderName
);

public record CompetitorRankObservation(
    Guid CompetitorId,
    Guid KeywordId,
    Guid ProjectId,
    DateOnly CheckDate,
    int? Position,
    string? RankedUrl,
    string ProviderName
);

public record OrganicSerpResult(
    int Position,
    string Url,
    string Domain,
    string ProviderName
);


public interface IRankTrackingProvider
{
    string ProviderName { get; }
    Task<IReadOnlyList<RankObservation>> GetObservationsAsync(
        Guid projectId,
        IEnumerable<Guid> keywordIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CompetitorRankObservation>> GetCompetitorObservationsAsync(
        Guid projectId,
        IEnumerable<Guid> keywordIds,
        IEnumerable<(Guid Id, string Domain)> competitors,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<CompetitorRankObservation>>(Array.Empty<CompetitorRankObservation>());
    }
}
