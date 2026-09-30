using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;

namespace InternalSEO.Infrastructure.Services;

public class AuditRuleEvaluator : IAuditRuleEvaluator
{
    private readonly IUrlNormalizer _urlNormalizer;

    public AuditRuleEvaluator(IUrlNormalizer urlNormalizer)
    {
        _urlNormalizer = urlNormalizer;
    }

    public AuditEvaluationResult Evaluate(Guid crawlRunId, Guid projectId, List<CrawlPageResult> crawledPages)
    {
        var issues = new List<AuditIssue>();
        var pageMap = crawledPages.ToDictionary(p => p.Url, StringComparer.OrdinalIgnoreCase);

        // 1. RULE-HTTP-404
        foreach (var page in crawledPages.Where(p => p.HttpStatusCode == 404))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-HTTP-404", "Error", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "HTTP_Headers",
                EvidencePayload = $"Server returned HTTP 404 (Not Found) for URL: {page.Url}"
            });
            issues.Add(issue);
        }

        // 2. RULE-HTTP-5XX
        foreach (var page in crawledPages.Where(p => p.HttpStatusCode >= 500 && p.HttpStatusCode <= 599))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-HTTP-5XX", "Error", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "HTTP_Headers",
                EvidencePayload = $"Server returned HTTP {page.HttpStatusCode} Server Error for URL: {page.Url}"
            });
            issues.Add(issue);
        }

        // 3. RULE-REDIRECT-FOUND (3xx)
        foreach (var page in crawledPages.Where(p => p.HttpStatusCode >= 300 && p.HttpStatusCode < 400))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-REDIRECT-FOUND", "Notice", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "Redirect_Chain",
                EvidencePayload = $"URL returned HTTP {page.HttpStatusCode} redirect."
            });
            issues.Add(issue);
        }

        // 4. Content & Indexability rules for successful 200 HTML pages
        var successfulPages = crawledPages.Where(p => p.HttpStatusCode == 200).ToList();

        // RULE-TITLE-MISSING
        foreach (var page in successfulPages.Where(p => string.IsNullOrWhiteSpace(p.Title)))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-TITLE-MISSING", "Error", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "DOM_Snippet",
                EvidencePayload = page.RawHeadSnippet ?? "No <title> tag found in document head."
            });
            issues.Add(issue);
        }

        // RULE-TITLE-DUPLICATE
        var titleGroups = successfulPages
            .Where(p => !string.IsNullOrWhiteSpace(p.Title))
            .GroupBy(p => p.Title!.Trim(), StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1);

        foreach (var group in titleGroups)
        {
            var duplicateUrls = group.Select(p => p.Url).ToList();
            foreach (var page in group)
            {
                var issue = CreateIssue(crawlRunId, projectId, "RULE-TITLE-DUPLICATE", "Error", page.Url, page.UrlHash);
                issue.Evidence.Add(new IssueEvidence
                {
                    IssueId = issue.Id,
                    EvidenceType = "DOM_Snippet",
                    EvidencePayload = $"Title \"{group.Key}\" is shared by {group.Count()} pages: {string.Join(", ", duplicateUrls.Take(5))}"
                });
                issues.Add(issue);
            }
        }

        // RULE-META-DESC-MISSING
        foreach (var page in successfulPages.Where(p => string.IsNullOrWhiteSpace(p.MetaDescription)))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-META-DESC-MISSING", "Warning", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "DOM_Snippet",
                EvidencePayload = page.RawHeadSnippet ?? "No <meta name=\"description\"> found in document head."
            });
            issues.Add(issue);
        }

        // RULE-CANONICAL-MISSING
        foreach (var page in successfulPages.Where(p => string.IsNullOrWhiteSpace(p.CanonicalUrl)))
        {
            var issue = CreateIssue(crawlRunId, projectId, "RULE-CANONICAL-MISSING", "Warning", page.Url, page.UrlHash);
            issue.Evidence.Add(new IssueEvidence
            {
                IssueId = issue.Id,
                EvidenceType = "DOM_Snippet",
                EvidencePayload = page.RawHeadSnippet ?? "No <link rel=\"canonical\"> found in document head."
            });
            issues.Add(issue);
        }

        // 5. RULE-BROKEN-INTERNAL-LINK
        // Identify any internal link on a page that targets a known crawled 4xx or 5xx page
        foreach (var page in crawledPages)
        {
            foreach (var outgoingLink in page.OutgoingInternalLinks)
            {
                if (pageMap.TryGetValue(outgoingLink, out var targetPage) && targetPage.HttpStatusCode >= 400)
                {
                    var issue = CreateIssue(crawlRunId, projectId, "RULE-BROKEN-INTERNAL-LINK", "Error", page.Url, page.UrlHash);
                    issue.Evidence.Add(new IssueEvidence
                    {
                        IssueId = issue.Id,
                        EvidenceType = "DOM_Snippet",
                        EvidencePayload = $"Internal hyperlink from {page.Url} to {outgoingLink} failed with HTTP {targetPage.HttpStatusCode}."
                    });
                    issues.Add(issue);
                }
            }
        }

        int errorsCount = issues.Count(i => i.Severity.Equals("Error", StringComparison.OrdinalIgnoreCase));
        int warningsCount = issues.Count(i => i.Severity.Equals("Warning", StringComparison.OrdinalIgnoreCase));
        int noticesCount = issues.Count(i => i.Severity.Equals("Notice", StringComparison.OrdinalIgnoreCase));

        int totalCrawled = crawledPages.Count;
        decimal healthScore = 100m;
        if (totalCrawled > 0)
        {
            decimal rawPenalty = ((errorsCount * 1.5m) + (warningsCount * 0.5m)) / totalCrawled * 100m;
            healthScore = Math.Clamp(Math.Round(100m - rawPenalty, 1), 0m, 100m);
        }

        return new AuditEvaluationResult
        {
            Issues = issues,
            ErrorsCount = errorsCount,
            WarningsCount = warningsCount,
            NoticesCount = noticesCount,
            HealthScore = healthScore
        };
    }

    private AuditIssue CreateIssue(
        Guid crawlRunId,
        Guid projectId,
        string ruleCode,
        string severity,
        string affectedUrl,
        string? urlHash = null)
    {
        var hash = !string.IsNullOrEmpty(urlHash) ? urlHash : _urlNormalizer.ComputeSha256Hash(affectedUrl);
        return new AuditIssue
        {
            Id = Guid.NewGuid(),
            CrawlRunId = crawlRunId,
            ProjectId = projectId,
            RuleCode = ruleCode,
            Severity = severity,
            AffectedUrl = affectedUrl,
            AffectedUrlHash = hash,
            Status = "Open",
            FirstSeenAt = DateTimeOffset.UtcNow,
            LastSeenAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
