using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;

namespace InternalSEO.Infrastructure.Services;

public class IssueVerificationEvaluator : IIssueVerificationEvaluator
{
    public IssueVerificationResult EvaluateRemediation(
        string ruleCode,
        string affectedUrl,
        CrawlPageResult pageResult,
        AuditIssue? sourceIssue = null)
    {
        if (pageResult == null)
        {
            return new IssueVerificationResult(
                IsPassed: false,
                IsSupported: true,
                Details: "Verification failed: Target page could not be fetched.");
        }

        var normalizedCode = ruleCode?.Trim().ToUpperInvariant() ?? string.Empty;

        switch (normalizedCode)
        {
            case "RULE-HTTP-404":
                if (pageResult.HttpStatusCode > 0 && pageResult.HttpStatusCode < 400)
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: $"Verification passed: URL returned HTTP {pageResult.HttpStatusCode} (404 resolved).");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: $"Verification failed: URL still returned HTTP {pageResult.HttpStatusCode}.");

            case "RULE-HTTP-5XX":
                if (pageResult.HttpStatusCode > 0 && pageResult.HttpStatusCode < 500)
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: $"Verification passed: URL returned HTTP {pageResult.HttpStatusCode} (Server error resolved).");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: $"Verification failed: URL still returned HTTP {pageResult.HttpStatusCode}.");

            case "RULE-REDIRECT-FOUND":
                if (pageResult.HttpStatusCode == 200)
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: "Verification passed: URL returned direct HTTP 200 OK (Redirect resolved).");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: $"Verification failed: URL returned HTTP {pageResult.HttpStatusCode} instead of direct 200 OK.");

            case "RULE-TITLE-MISSING":
                if (pageResult.HttpStatusCode == 200 && !string.IsNullOrWhiteSpace(pageResult.Title))
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: $"Verification passed: Non-empty <title> found (\"{pageResult.Title}\").");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: "Verification failed: <title> tag is still missing or empty.");

            case "RULE-META-DESC-MISSING":
                if (pageResult.HttpStatusCode == 200 && !string.IsNullOrWhiteSpace(pageResult.MetaDescription))
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: "Verification passed: Meta description found.");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: "Verification failed: Meta description tag is still missing or empty.");

            case "RULE-CANONICAL-MISSING":
                if (pageResult.HttpStatusCode == 200 && !string.IsNullOrWhiteSpace(pageResult.CanonicalUrl))
                {
                    return new IssueVerificationResult(
                        IsPassed: true,
                        IsSupported: true,
                        Details: $"Verification passed: Canonical link tag found ({pageResult.CanonicalUrl}).");
                }
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: true,
                    Details: "Verification failed: Canonical link tag is still missing or empty.");

            case "RULE-TITLE-DUPLICATE":
                // Single-page recheck cannot verify site-wide uniqueness
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: false,
                    Details: "Verification for duplicate title requires a full website crawl to confirm cross-site uniqueness.");

            case "RULE-BROKEN-INTERNAL-LINK":
                // Single-page recheck without site-wide crawling cannot confirm all internal link resolutions
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: false,
                    Details: "Verification for broken internal links requires full crawl link graph evaluation.");

            default:
                return new IssueVerificationResult(
                    IsPassed: false,
                    IsSupported: false,
                    Details: $"Rule '{ruleCode}' is not supported for single-page automated verification.");
        }
    }
}
