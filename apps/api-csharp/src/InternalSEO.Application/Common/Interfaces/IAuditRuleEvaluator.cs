using InternalSEO.Domain.Entities;

namespace InternalSEO.Application.Common.Interfaces;

public class AuditEvaluationResult
{
    public List<AuditIssue> Issues { get; set; } = new();
    public int ErrorsCount { get; set; }
    public int WarningsCount { get; set; }
    public int NoticesCount { get; set; }
    public decimal HealthScore { get; set; }
}

public interface IAuditRuleEvaluator
{
    AuditEvaluationResult Evaluate(Guid crawlRunId, Guid projectId, List<CrawlPageResult> crawledPages);
}
