using InternalSEO.Domain.Common;
using InternalSEO.Domain.Enums;

namespace InternalSEO.Domain.Entities;

public class Project : BaseAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string PrimaryDomain { get; set; } = string.Empty;
    public string Protocol { get; set; } = "https://";
    public string? Industry { get; set; }
    public string CountryCode { get; set; } = "US";
    public string? PrimaryLocation { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Timezone { get; set; } = "UTC";
    public string DefaultSearchEngine { get; set; } = "google";
    public string DefaultDevice { get; set; } = "desktop";
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public bool IsArchived { get; set; } = false;

    // Creator
    public new Guid CreatedBy { get; set; }
    public virtual User Creator { get; set; } = null!;

    // Members
    public virtual ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    // SEO Data Management
    public virtual ICollection<Keyword> Keywords { get; set; } = new List<Keyword>();
    public virtual ICollection<KeywordGroup> KeywordGroups { get; set; } = new List<KeywordGroup>();
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public virtual ICollection<RankResult> RankResults { get; set; } = new List<RankResult>();

    // Technical Audit & Crawl
    public virtual ProjectSettings? Settings { get; set; }
    public virtual ICollection<CrawlRun> CrawlRuns { get; set; } = new List<CrawlRun>();
    public virtual ICollection<CrawlPage> CrawlPages { get; set; } = new List<CrawlPage>();
    public virtual ICollection<AuditIssue> AuditIssues { get; set; } = new List<AuditIssue>();

    // SEO Tasks
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // Google Integrations & GSC
    public virtual ICollection<GoogleConnection> GoogleConnections { get; set; } = new List<GoogleConnection>();
    public virtual ICollection<GscDailyMetric> GscDailyMetrics { get; set; } = new List<GscDailyMetric>();
    public virtual ICollection<GscQueryMetric> GscQueryMetrics { get; set; } = new List<GscQueryMetric>();

    // Reports
    public virtual ICollection<ReportRun> ReportRuns { get; set; } = new List<ReportRun>();

    // Notifications
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    // Competitors
    public virtual ICollection<Competitor> Competitors { get; set; } = new List<Competitor>();
    public virtual ICollection<CompetitorRankResult> CompetitorRankResults { get; set; } = new List<CompetitorRankResult>();
}

