using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectMember> ProjectMembers { get; }
    DbSet<ActivityLog> ActivityLogs { get; }
    DbSet<Keyword> Keywords { get; }
    DbSet<KeywordGroup> KeywordGroups { get; }
    DbSet<Tag> Tags { get; }
    DbSet<KeywordTag> KeywordTags { get; }
    DbSet<RankResult> RankResults { get; }
    DbSet<ProjectSettings> ProjectSettings { get; }
    DbSet<CrawlRun> CrawlRuns { get; }
    DbSet<CrawlPage> CrawlPages { get; }
    DbSet<AuditRule> AuditRules { get; }
    DbSet<AuditIssue> AuditIssues { get; }
    DbSet<IssueEvidence> IssueEvidence { get; }
    DbSet<TaskItem> Tasks { get; }
    DbSet<TaskVerification> TaskVerifications { get; }
    DbSet<TaskComment> TaskComments { get; }
    DbSet<GoogleConnection> GoogleConnections { get; }
    DbSet<GscDailyMetric> GscDailyMetrics { get; }
    DbSet<GscQueryMetric> GscQueryMetrics { get; }
    DbSet<ReportRun> ReportRuns { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<OAuthNonce> OAuthNonces { get; }
    DbSet<Ga4DailyMetric> Ga4DailyMetrics { get; }
    DbSet<Ga4LandingPageMetric> Ga4LandingPageMetrics { get; }
    DbSet<Competitor> Competitors { get; }
    DbSet<CompetitorRankResult> CompetitorRankResults { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
