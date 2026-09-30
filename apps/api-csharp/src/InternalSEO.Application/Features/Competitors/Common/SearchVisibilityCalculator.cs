namespace InternalSEO.Application.Features.Competitors.Common;

public static class SearchVisibilityCalculator
{
    public static decimal CalculateWeight(int? position)
    {
        if (!position.HasValue || position.Value < 1 || position.Value > 100)
            return 0m;

        return position.Value switch
        {
            1 => 31.7m,
            2 => 24.7m,
            3 => 18.7m,
            4 => 13.6m,
            5 => 9.5m,
            <= 10 => 3.5m,
            <= 20 => 1.5m,
            <= 30 => 0.7m,
            _ => 0.1m
        };
    }

    public static decimal CalculateScore(IEnumerable<int?> positions, int totalProjectKeywords)
    {
        if (totalProjectKeywords <= 0)
            return 0m;

        decimal totalCtr = 0m;
        foreach (var pos in positions)
        {
            totalCtr += CalculateWeight(pos);
        }

        return Math.Round(totalCtr / totalProjectKeywords, 1);
    }
}
