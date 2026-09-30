using InternalSEO.Domain.Entities;

namespace InternalSEO.Application.Common.Interfaces;

public record IssueVerificationResult(
    bool IsPassed,
    bool IsSupported,
    string Details
);

public interface IIssueVerificationEvaluator
{
    IssueVerificationResult EvaluateRemediation(
        string ruleCode,
        string affectedUrl,
        CrawlPageResult pageResult,
        AuditIssue? sourceIssue = null);
}
