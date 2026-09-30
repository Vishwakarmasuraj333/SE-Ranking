using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Competitors.Common;

namespace InternalSEO.Infrastructure.Services;

public class DevelopmentRankTrackingProvider : IRankTrackingProvider
{
    public string ProviderName => "development";

    public Task<IReadOnlyList<RankObservation>> GetObservationsAsync(
        Guid projectId,
        IEnumerable<Guid> keywordIds,
        CancellationToken cancellationToken = default)
    {
        var observations = new List<RankObservation>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        int index = 0;
        foreach (var keywordId in keywordIds)
        {
            // Deterministic positions based on index
            int? currentPos = (index % 5) switch
            {
                0 => 2,   // Top 5
                1 => 5,   // Top 5
                2 => 9,   // Top 10
                3 => 24,  // Top 30
                _ => null // Unranked / >100
            };

            int? prevPos = currentPos.HasValue ? currentPos.Value + ((index % 3) - 1) : null;
            int? change = (currentPos.HasValue && prevPos.HasValue) ? (prevPos.Value - currentPos.Value) : null;

            observations.Add(new RankObservation(
                keywordId,
                projectId,
                today,
                currentPos,
                prevPos,
                change,
                currentPos.HasValue ? "https://portal.company.com/page-" + (index + 1) : null,
                true,
                false,
                "featured_snippet",
                ProviderName
            ));

            index++;
        }

        return Task.FromResult<IReadOnlyList<RankObservation>>(observations);
    }

    /// <summary>
    /// Generates a deterministic simulated organic SERP (positions 1..100) for a given keyword.
    /// Completely independent of tracked competitors.
    /// Virtual for testability and inspection.
    /// </summary>
    public virtual IReadOnlyList<OrganicSerpResult> GenerateSimulatedSerp(
        Guid keywordId,
        int kwIndex)
    {
        var results = new List<OrganicSerpResult>(100);

        // Deterministic organic search landscape:
        // Well-known and benchmark industry domains placed at deterministic organic positions per keyword index.
        // Competitors are NOT known here; their positions will only be discovered via downstream matching.
        var benchmarkDomainsAtPositions = new Dictionary<int, string>
        {
            [1] = "alpharival.com",
            [3] = "rival-market.com",
            [4] = "competitor-a.com",
            [7] = "industry-benchmark.com",
            [9] = "competitor-b.com",
            [12] = "sector-leader.org",
            [15] = "betarival.com",
            [25] = "secondary-rival.net",
            [42] = "emerging-rival.io",
            [68] = "deep-market-competitor.com"
        };

        // For keywords beyond the first (kwIndex > 0), deterministically permute positions across the landscape
        // so different keywords exhibit realistic differing rankings for domains
        var offset = kwIndex * 3;

        for (int pos = 1; pos <= 100; pos++)
        {
            var lookupPos = ((pos - 1 - offset) % 100);
            if (lookupPos < 0) lookupPos += 100;
            lookupPos += 1;

            if (benchmarkDomainsAtPositions.TryGetValue(lookupPos, out var matchedDomain))
            {
                var normalizedHost = CompetitorNormalizer.NormalizeDomain(matchedDomain);
                var url = $"https://{normalizedHost}/blog/article-kw{kwIndex + 1}";
                results.Add(new OrganicSerpResult(pos, url, normalizedHost, ProviderName));
            }
            else
            {
                var genericDomain = $"organic-site-pos{pos}-kw{kwIndex + 1}.org";
                var url = $"https://{genericDomain}/resource/{pos}";
                results.Add(new OrganicSerpResult(pos, url, genericDomain, ProviderName));
            }
        }

        return results;
    }

    public Task<IReadOnlyList<CompetitorRankObservation>> GetCompetitorObservationsAsync(
        Guid projectId,
        IEnumerable<Guid> keywordIds,
        IEnumerable<(Guid Id, string Domain)> competitors,
        CancellationToken cancellationToken = default)
    {
        var observations = new List<CompetitorRankObservation>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var compList = competitors.ToList();

        if (compList.Count == 0)
            return Task.FromResult<IReadOnlyList<CompetitorRankObservation>>(observations);

        int kwIndex = 0;
        foreach (var keywordId in keywordIds)
        {
            // 1. Generate independent simulated SERP for this tracked keyword (NO competitor inputs)
            var serpResults = GenerateSimulatedSerp(keywordId, kwIndex);

            // 2. Evaluate simulated SERP results against registered competitor domains
            foreach (var comp in compList)
            {
                var normalizedCompDomain = CompetitorNormalizer.NormalizeDomain(comp.Domain);

                // 3. Find matched organic result in the simulated SERP
                // Domain matching is strictly normalized hostname comparison
                var matchedResult = serpResults.FirstOrDefault(r =>
                    CompetitorNormalizer.NormalizeDomain(r.Domain).Equals(normalizedCompDomain, StringComparison.OrdinalIgnoreCase) ||
                    CompetitorNormalizer.NormalizeDomain(r.Url).Equals(normalizedCompDomain, StringComparison.OrdinalIgnoreCase));

                // 4. Observation position and ranked URL MUST COME FROM THE MATCHED SERP ORGANIC RESULT
                int? position = matchedResult?.Position;
                string? rankedUrl = matchedResult?.Url;

                observations.Add(new CompetitorRankObservation(
                    comp.Id,
                    keywordId,
                    projectId,
                    today,
                    position,
                    rankedUrl,
                    ProviderName));
            }

            kwIndex++;
        }

        return Task.FromResult<IReadOnlyList<CompetitorRankObservation>>(observations);
    }
}
