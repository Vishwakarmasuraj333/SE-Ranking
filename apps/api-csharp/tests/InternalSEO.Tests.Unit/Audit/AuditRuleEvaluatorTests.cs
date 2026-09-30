using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Infrastructure.Services;
using Xunit;

namespace InternalSEO.Tests.Unit.Audit;

public class AuditRuleEvaluatorTests
{
    private readonly AuditRuleEvaluator _evaluator;

    public AuditRuleEvaluatorTests()
    {
        _evaluator = new AuditRuleEvaluator(new UrlNormalizer());
    }

    [Fact]
    public void Evaluate_Detects404And5xxErrors()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = new List<CrawlPageResult>
        {
            new() { Url = "https://company.com/", HttpStatusCode = 200, Title = "Home", MetaDescription = "Desc", CanonicalUrl = "https://company.com/" },
            new() { Url = "https://company.com/missing", HttpStatusCode = 404 },
            new() { Url = "https://company.com/crash", HttpStatusCode = 500 }
        };

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.ErrorsCount.Should().Be(2);
        result.Issues.Should().Contain(i => i.RuleCode == "RULE-HTTP-404" && i.AffectedUrl == "https://company.com/missing");
        result.Issues.Should().Contain(i => i.RuleCode == "RULE-HTTP-5XX" && i.AffectedUrl == "https://company.com/crash");
    }

    [Fact]
    public void Evaluate_DetectsMissingTitleAndDuplicateTitle()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = new List<CrawlPageResult>
        {
            new() { Url = "https://company.com/p1", HttpStatusCode = 200, Title = null, MetaDescription = "Desc", CanonicalUrl = "https://company.com/p1" },
            new() { Url = "https://company.com/p2", HttpStatusCode = 200, Title = "Identical Title", MetaDescription = "Desc", CanonicalUrl = "https://company.com/p2" },
            new() { Url = "https://company.com/p3", HttpStatusCode = 200, Title = "Identical Title", MetaDescription = "Desc", CanonicalUrl = "https://company.com/p3" }
        };

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.Issues.Should().Contain(i => i.RuleCode == "RULE-TITLE-MISSING" && i.AffectedUrl == "https://company.com/p1");
        result.Issues.Where(i => i.RuleCode == "RULE-TITLE-DUPLICATE").Should().HaveCount(2);
    }

    [Fact]
    public void Evaluate_DetectsMissingMetaDescriptionAndMissingCanonical()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = new List<CrawlPageResult>
        {
            new() { Url = "https://company.com/about", HttpStatusCode = 200, Title = "About Us", MetaDescription = null, CanonicalUrl = null }
        };

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.WarningsCount.Should().Be(2);
        result.Issues.Should().Contain(i => i.RuleCode == "RULE-META-DESC-MISSING");
        result.Issues.Should().Contain(i => i.RuleCode == "RULE-CANONICAL-MISSING");
    }

    [Fact]
    public void Evaluate_DetectsBrokenInternalHyperlinks()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = new List<CrawlPageResult>
        {
            new()
            {
                Url = "https://company.com/page-a",
                HttpStatusCode = 200,
                Title = "Page A",
                MetaDescription = "Desc A",
                CanonicalUrl = "https://company.com/page-a",
                OutgoingInternalLinks = new List<string> { "https://company.com/broken-target" }
            },
            new()
            {
                Url = "https://company.com/broken-target",
                HttpStatusCode = 404
            }
        };

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.Issues.Should().Contain(i => i.RuleCode == "RULE-BROKEN-INTERNAL-LINK" && i.AffectedUrl == "https://company.com/page-a");
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore100_WhenNoIssuesPresent()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = Enumerable.Range(1, 10).Select(i => new CrawlPageResult
        {
            Url = $"https://company.com/p{i}",
            HttpStatusCode = 200,
            Title = $"Page {i}",
            MetaDescription = $"Desc {i}",
            CanonicalUrl = $"https://company.com/p{i}"
        }).ToList();

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.HealthScore.Should().Be(100m);
        result.ErrorsCount.Should().Be(0);
        result.WarningsCount.Should().Be(0);
        result.NoticesCount.Should().Be(0);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_ErrorsOnly()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // 9 valid pages + 1 404 error page (1 Error total)
        var pages = Enumerable.Range(1, 9).Select(i => new CrawlPageResult
        {
            Url = $"https://company.com/p{i}",
            HttpStatusCode = 200,
            Title = $"Page {i}",
            MetaDescription = $"Desc {i}",
            CanonicalUrl = $"https://company.com/p{i}"
        }).ToList();

        pages.Add(new CrawlPageResult { Url = "https://company.com/missing", HttpStatusCode = 404 });

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.ErrorsCount.Should().Be(1);
        result.WarningsCount.Should().Be(0);
        // Formula: 100 - (1 * 1.5 / 10 * 100) = 100 - 15 = 85.0
        result.HealthScore.Should().Be(85.0m);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_WarningsOnly()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // 8 valid pages + 2 pages with missing meta description (2 Warnings total)
        var pages = Enumerable.Range(1, 8).Select(i => new CrawlPageResult
        {
            Url = $"https://company.com/p{i}",
            HttpStatusCode = 200,
            Title = $"Page {i}",
            MetaDescription = $"Desc {i}",
            CanonicalUrl = $"https://company.com/p{i}"
        }).ToList();

        pages.Add(new CrawlPageResult { Url = "https://company.com/warn1", HttpStatusCode = 200, Title = "W1", CanonicalUrl = "https://company.com/warn1" });
        pages.Add(new CrawlPageResult { Url = "https://company.com/warn2", HttpStatusCode = 200, Title = "W2", CanonicalUrl = "https://company.com/warn2" });

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.ErrorsCount.Should().Be(0);
        result.WarningsCount.Should().Be(2);
        // Formula: 100 - (2 * 0.5 / 10 * 100) = 100 - 10 = 90.0
        result.HealthScore.Should().Be(90.0m);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_MixedErrorsAndWarnings()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // 7 valid pages + 1 404 (1 Error) + 2 missing canonicals (2 Warnings)
        var pages = Enumerable.Range(1, 7).Select(i => new CrawlPageResult
        {
            Url = $"https://company.com/p{i}",
            HttpStatusCode = 200,
            Title = $"Page {i}",
            MetaDescription = $"Desc {i}",
            CanonicalUrl = $"https://company.com/p{i}"
        }).ToList();

        pages.Add(new CrawlPageResult { Url = "https://company.com/err1", HttpStatusCode = 404 });
        pages.Add(new CrawlPageResult { Url = "https://company.com/warn1", HttpStatusCode = 200, Title = "W1", MetaDescription = "Desc" });
        pages.Add(new CrawlPageResult { Url = "https://company.com/warn2", HttpStatusCode = 200, Title = "W2", MetaDescription = "Desc" });

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.ErrorsCount.Should().Be(1);
        result.WarningsCount.Should().Be(2);
        // Formula: 100 - ((1 * 1.5 + 2 * 0.5) / 10 * 100) = 100 - 25 = 75.0
        result.HealthScore.Should().Be(75.0m);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_NoticesDoNotPenalize()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // 9 valid pages + 1 301 redirect (1 Notice total)
        var pages = Enumerable.Range(1, 9).Select(i => new CrawlPageResult
        {
            Url = $"https://company.com/p{i}",
            HttpStatusCode = 200,
            Title = $"Page {i}",
            MetaDescription = $"Desc {i}",
            CanonicalUrl = $"https://company.com/p{i}"
        }).ToList();

        pages.Add(new CrawlPageResult { Url = "https://company.com/redirect", HttpStatusCode = 301 });

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.NoticesCount.Should().Be(1);
        result.ErrorsCount.Should().Be(0);
        result.WarningsCount.Should().Be(0);
        // Notices must NOT penalize
        result.HealthScore.Should().Be(100.0m);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_ClampedAtZero()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        // 1 page with 404 error (penalty = 150 -> clamped to 0)
        var pages = new List<CrawlPageResult>
        {
            new() { Url = "https://company.com/broken", HttpStatusCode = 404 }
        };

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.ErrorsCount.Should().Be(1);
        result.HealthScore.Should().Be(0.0m);
    }

    [Fact]
    public void Evaluate_CalculatesHealthScore_ZeroCrawledUrls_EvaluatesTo100()
    {
        var crawlRunId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var pages = new List<CrawlPageResult>();

        var result = _evaluator.Evaluate(crawlRunId, projectId, pages);

        result.HealthScore.Should().Be(100.0m);
        result.ErrorsCount.Should().Be(0);
        result.WarningsCount.Should().Be(0);
        result.NoticesCount.Should().Be(0);
    }
}
