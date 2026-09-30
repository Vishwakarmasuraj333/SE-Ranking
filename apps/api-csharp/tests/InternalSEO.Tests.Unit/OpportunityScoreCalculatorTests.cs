using InternalSEO.Application.Features.Competitors.Common;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class OpportunityScoreCalculatorTests
{
    [Fact]
    public void Position1_CalculatesCorrectly()
    {
        // Pos 1 CTR = 31.7. Volume 1000 * 31.7 / 1000 = 31.7
        double score = OpportunityScoreCalculator.Calculate(1000, 1);
        Assert.Equal(31.7, score);
    }

    [Fact]
    public void Position2_CalculatesCorrectly()
    {
        // Pos 2 CTR = 24.7. Volume 1000 * 24.7 / 1000 = 24.7
        double score = OpportunityScoreCalculator.Calculate(1000, 2);
        Assert.Equal(24.7, score);
    }

    [Fact]
    public void Position3_CalculatesCorrectly()
    {
        // Pos 3 CTR = 18.7. Volume 1000 * 18.7 / 1000 = 18.7
        double score = OpportunityScoreCalculator.Calculate(1000, 3);
        Assert.Equal(18.7, score);
    }

    [Fact]
    public void Position4_CalculatesCorrectly()
    {
        // Pos 4 CTR = 13.6. Volume 1000 * 13.6 / 1000 = 13.6
        double score = OpportunityScoreCalculator.Calculate(1000, 4);
        Assert.Equal(13.6, score);
    }

    [Fact]
    public void Position5_CalculatesCorrectly()
    {
        // Pos 5 CTR = 9.5. Volume 1000 * 9.5 / 1000 = 9.5
        double score = OpportunityScoreCalculator.Calculate(1000, 5);
        Assert.Equal(9.5, score);
    }

    [Theory]
    [InlineData(6)]
    [InlineData(8)]
    [InlineData(10)]
    public void Positions6To10_UseCtrWeight3Point5(int position)
    {
        // Pos 6-10 CTR = 3.5. Volume 2000 * 3.5 / 1000 = 7.0
        double score = OpportunityScoreCalculator.Calculate(2000, position);
        Assert.Equal(7.0, score);
    }

    [Theory]
    [InlineData(11)]
    [InlineData(15)]
    [InlineData(20)]
    public void Positions11To20_UseCtrWeight1Point5(int position)
    {
        // Pos 11-20 CTR = 1.5. Volume 2000 * 1.5 / 1000 = 3.0
        double score = OpportunityScoreCalculator.Calculate(2000, position);
        Assert.Equal(3.0, score);
    }

    [Theory]
    [InlineData(21)]
    [InlineData(50)]
    [InlineData(100)]
    public void PositionGreaterThan20_ReturnsZero(int position)
    {
        double score = OpportunityScoreCalculator.Calculate(1000, position);
        Assert.Equal(0.0, score);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-5)]
    public void InvalidPosition_ReturnsZero(int position)
    {
        double score = OpportunityScoreCalculator.Calculate(1000, position);
        Assert.Equal(0.0, score);
    }

    [Fact]
    public void NullSearchVolume_ReturnsZero()
    {
        double score = OpportunityScoreCalculator.Calculate(null, 1);
        Assert.Equal(0.0, score);
    }

    [Fact]
    public void ZeroSearchVolume_ReturnsZero()
    {
        double score = OpportunityScoreCalculator.Calculate(0, 1);
        Assert.Equal(0.0, score);
    }

    [Fact]
    public void NegativeSearchVolume_ReturnsZero()
    {
        double score = OpportunityScoreCalculator.Calculate(-500, 1);
        Assert.Equal(0.0, score);
    }

    [Fact]
    public void ScoreCappedAt100_WhenRawScoreExceeds100()
    {
        // Volume 50,000 at Pos 1: 50,000 * 31.7 / 1000 = 1585.0 -> Capped at 100.0
        double score = OpportunityScoreCalculator.Calculate(50000, 1);
        Assert.Equal(100.0, score);
    }

    [Fact]
    public void RoundingBehavior_RoundsToOneDecimalPlace()
    {
        // Volume 125 at Pos 1: 125 * 31.7 / 1000 = 3.9625 -> Rounds to 4.0
        double score = OpportunityScoreCalculator.Calculate(125, 1);
        Assert.Equal(4.0, score);

        // Volume 110 at Pos 4: 110 * 13.6 / 1000 = 1.496 -> Rounds to 1.5
        double score2 = OpportunityScoreCalculator.Calculate(110, 4);
        Assert.Equal(1.5, score2);
    }
}
