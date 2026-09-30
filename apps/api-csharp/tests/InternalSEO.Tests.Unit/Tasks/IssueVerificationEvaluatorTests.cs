using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Infrastructure.Services;
using Xunit;

namespace InternalSEO.Tests.Unit.Tasks;

public class IssueVerificationEvaluatorTests
{
    private readonly IssueVerificationEvaluator _evaluator = new();

    [Fact]
    public void EvaluateRemediation_NullPageResult_ReturnsFailedSupported()
    {
        var result = _evaluator.EvaluateRemediation("RULE-HTTP-404", "https://example.com/page", null!);

        result.IsPassed.Should().BeFalse();
        result.IsSupported.Should().BeTrue();
        result.Details.Should().Contain("Target page could not be fetched");
    }

    [Theory]
    [InlineData(200, true)]
    [InlineData(301, true)]
    [InlineData(404, false)]
    [InlineData(500, false)]
    public void EvaluateRemediation_RuleHttp404(int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode
        };

        var result = _evaluator.EvaluateRemediation("RULE-HTTP-404", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData(200, true)]
    [InlineData(404, true)]
    [InlineData(500, false)]
    [InlineData(503, false)]
    public void EvaluateRemediation_RuleHttp5xx(int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode
        };

        var result = _evaluator.EvaluateRemediation("RULE-HTTP-5XX", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData(200, true)]
    [InlineData(301, false)]
    [InlineData(302, false)]
    public void EvaluateRemediation_RuleRedirectFound(int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode
        };

        var result = _evaluator.EvaluateRemediation("RULE-REDIRECT-FOUND", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData("Valid Title", 200, true)]
    [InlineData("", 200, false)]
    [InlineData("   ", 200, false)]
    [InlineData(null, 200, false)]
    [InlineData("Valid Title", 500, false)]
    public void EvaluateRemediation_RuleTitleMissing(string? title, int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode,
            Title = title
        };

        var result = _evaluator.EvaluateRemediation("RULE-TITLE-MISSING", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData("Valid meta description", 200, true)]
    [InlineData("", 200, false)]
    [InlineData(null, 200, false)]
    public void EvaluateRemediation_RuleMetaDescMissing(string? metaDesc, int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode,
            MetaDescription = metaDesc
        };

        var result = _evaluator.EvaluateRemediation("RULE-META-DESC-MISSING", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData("https://example.com/canonical", 200, true)]
    [InlineData("", 200, false)]
    [InlineData(null, 200, false)]
    public void EvaluateRemediation_RuleCanonicalMissing(string? canonical, int statusCode, bool expectedPassed)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = statusCode,
            CanonicalUrl = canonical
        };

        var result = _evaluator.EvaluateRemediation("RULE-CANONICAL-MISSING", page.Url, page);

        result.IsSupported.Should().BeTrue();
        result.IsPassed.Should().Be(expectedPassed);
    }

    [Theory]
    [InlineData("RULE-TITLE-DUPLICATE")]
    [InlineData("RULE-BROKEN-INTERNAL-LINK")]
    [InlineData("RULE-UNKNOWN-XYZ")]
    public void EvaluateRemediation_UnsupportedRules_ReturnsIsSupportedFalse(string ruleCode)
    {
        var page = new CrawlPageResult
        {
            Url = "https://example.com/page",
            HttpStatusCode = 200
        };

        var result = _evaluator.EvaluateRemediation(ruleCode, page.Url, page);

        result.IsSupported.Should().BeFalse();
        result.IsPassed.Should().BeFalse();
        result.Details.Should().NotBeNullOrWhiteSpace();
    }
}
