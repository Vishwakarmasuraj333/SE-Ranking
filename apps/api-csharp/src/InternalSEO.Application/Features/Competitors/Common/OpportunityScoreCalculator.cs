namespace InternalSEO.Application.Features.Competitors.Common;

/// <summary>
/// Reusable calculator for keyword gap opportunity scores.
/// Formula:
/// OpportunityScore = min(100, round((MonthlySearchVolume * CTRWeight(bestCompetitorPosition)) / 1000, 1))
/// Uses approved CTR weights:
/// Position 1 = 31.7
/// Position 2 = 24.7
/// Position 3 = 18.7
/// Position 4 = 13.6
/// Position 5 = 9.5
/// Positions 6-10 = 3.5
/// Positions 11-20 = 1.5
/// </summary>
public static class OpportunityScoreCalculator
{
    public static double GetCtrWeight(int position)
    {
        return position switch
        {
            1 => 31.7,
            2 => 24.7,
            3 => 18.7,
            4 => 13.6,
            5 => 9.5,
            >= 6 and <= 10 => 3.5,
            >= 11 and <= 20 => 1.5,
            _ => 0.0
        };
    }

    public static double Calculate(int? monthlySearchVolume, int bestCompetitorPosition)
    {
        if (!monthlySearchVolume.HasValue || monthlySearchVolume.Value <= 0)
            return 0.0;

        if (bestCompetitorPosition < 1 || bestCompetitorPosition > 20)
            return 0.0;

        double ctr = GetCtrWeight(bestCompetitorPosition);
        if (ctr <= 0.0)
            return 0.0;

        double raw = (monthlySearchVolume.Value * ctr) / 1000.0;
        double rounded = Math.Round(raw, 1, MidpointRounding.AwayFromZero);
        return Math.Min(100.0, rounded);
    }
}
