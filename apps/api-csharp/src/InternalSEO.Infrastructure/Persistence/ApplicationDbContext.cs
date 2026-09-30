using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Keyword> Keywords => Set<Keyword>();
    public DbSet<KeywordGroup> KeywordGroups => Set<KeywordGroup>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<KeywordTag> KeywordTags => Set<KeywordTag>();
    public DbSet<RankResult> RankResults => Set<RankResult>();
    public DbSet<ProjectSettings> ProjectSettings => Set<ProjectSettings>();
    public DbSet<CrawlRun> CrawlRuns => Set<CrawlRun>();
    public DbSet<CrawlPage> CrawlPages => Set<CrawlPage>();
    public DbSet<AuditRule> AuditRules => Set<AuditRule>();
    public DbSet<AuditIssue> AuditIssues => Set<AuditIssue>();
    public DbSet<IssueEvidence> IssueEvidence => Set<IssueEvidence>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskVerification> TaskVerifications => Set<TaskVerification>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<GoogleConnection> GoogleConnections => Set<GoogleConnection>();
    public DbSet<GscDailyMetric> GscDailyMetrics => Set<GscDailyMetric>();
    public DbSet<GscQueryMetric> GscQueryMetrics => Set<GscQueryMetric>();
    public DbSet<ReportRun> ReportRuns => Set<ReportRun>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<OAuthNonce> OAuthNonces => Set<OAuthNonce>();
    public DbSet<Ga4DailyMetric> Ga4DailyMetrics => Set<Ga4DailyMetric>();
    public DbSet<Ga4LandingPageMetric> Ga4LandingPageMetrics => Set<Ga4LandingPageMetric>();
    public DbSet<Competitor> Competitors => Set<Competitor>();
    public DbSet<CompetitorRankResult> CompetitorRankResults => Set<CompetitorRankResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var properties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(DateTimeOffset) || p.PropertyType == typeof(DateTimeOffset?));
                foreach (var property in properties)
                {
                    modelBuilder.Entity(entityType.Name).Property(property.Name)
                        .HasConversion(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.DateTimeOffsetToBinaryConverter());
                }
            }
        }

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.NormalizedEmail).IsRequired().HasMaxLength(256);
            entity.HasIndex(e => e.NormalizedEmail).IsUnique();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
        });

        // Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.NormalizedName).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.NormalizedName).IsUnique();
            entity.Property(e => e.Description).HasMaxLength(250);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
        });

        // UserRole Configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(e => new { e.UserId, e.RoleId });
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
        });

        // Project Configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PrimaryDomain).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.PrimaryDomain);
            entity.HasIndex(e => new { e.Status, e.IsArchived });
            entity.Property(e => e.Protocol).IsRequired().HasMaxLength(10).HasDefaultValue("https://");
            entity.Property(e => e.CountryCode).IsRequired().HasMaxLength(2).HasDefaultValue("US");
            entity.Property(e => e.LanguageCode).IsRequired().HasMaxLength(5).HasDefaultValue("en");
            entity.Property(e => e.Timezone).IsRequired().HasMaxLength(100).HasDefaultValue("UTC");
            entity.Property(e => e.DefaultSearchEngine).IsRequired().HasMaxLength(50).HasDefaultValue("google");
            entity.Property(e => e.DefaultDevice).IsRequired().HasMaxLength(20).HasDefaultValue("desktop");
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.IsArchived).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasOne(e => e.Creator)
                .WithMany(u => u.CreatedProjects)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProjectMember Configuration
        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.ToTable("ProjectMembers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ProjectId, e.UserId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.AccessLevel).HasConversion<int>();
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ProjectMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ActivityLog Configuration
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.ToTable("ActivityLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActorEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.ActorRole).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ActionType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.CreatedAt });
            entity.HasIndex(e => new { e.EntityType, e.EntityId });

            entity.HasOne(e => e.Actor)
                .WithMany(u => u.ActivityLogs)
                .HasForeignKey(e => e.ActorId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.ActivityLogs)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // KeywordGroup Configuration
        modelBuilder.Entity<KeywordGroup>(entity =>
        {
            entity.ToTable("KeywordGroups");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ColorHex).HasMaxLength(7).HasDefaultValue("#3B82F6");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.HasIndex(e => new { e.ProjectId, e.Name }).IsUnique();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.KeywordGroups)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Tag Configuration
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.ToTable("Tags");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.HasIndex(e => new { e.ProjectId, e.Name }).IsUnique();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Tags)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // KeywordTag Configuration (Many-to-Many join)
        modelBuilder.Entity<KeywordTag>(entity =>
        {
            entity.ToTable("KeywordTags");
            entity.HasKey(e => new { e.KeywordId, e.TagId });

            entity.HasOne(e => e.Keyword)
                .WithMany(k => k.KeywordTags)
                .HasForeignKey(e => e.KeywordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.KeywordTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Keyword Configuration
        modelBuilder.Entity<Keyword>(entity =>
        {
            entity.ToTable("Keywords");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.KeywordText).IsRequired().HasMaxLength(300);
            entity.Property(e => e.NormalizedText).IsRequired().HasMaxLength(300);
            entity.Property(e => e.SearchEngine).IsRequired().HasMaxLength(50).HasDefaultValue("google");
            entity.Property(e => e.CountryCode).IsRequired().HasMaxLength(2).HasDefaultValue("US");
            entity.Property(e => e.LocationName).HasMaxLength(150);
            entity.Property(e => e.LanguageCode).IsRequired().HasMaxLength(5).HasDefaultValue("en");
            entity.Property(e => e.Device).IsRequired().HasMaxLength(20).HasDefaultValue("desktop");
            entity.Property(e => e.TargetUrl).HasMaxLength(2048);
            entity.Property(e => e.SearchIntent).HasMaxLength(30);
            entity.Property(e => e.KeywordDifficulty).HasPrecision(5, 2);
            entity.Property(e => e.CpcUsd).HasPrecision(8, 2);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.IsActive });
            entity.HasIndex(e => new { e.ProjectId, e.NormalizedText, e.SearchEngine, e.CountryCode, e.Device, e.LocationName }).IsUnique();

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Keywords)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Group)
                .WithMany(g => g.Keywords)
                .HasForeignKey(e => e.GroupId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // RankResult Configuration
        modelBuilder.Entity<RankResult>(entity =>
        {
            entity.ToTable("RankResults");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.RankedUrl).HasMaxLength(2048);
            entity.Property(e => e.SerpFeatures).HasMaxLength(500);
            entity.Property(e => e.ProviderName).IsRequired().HasMaxLength(50).HasDefaultValue("development");
            entity.Property(e => e.ProviderTaskId).HasMaxLength(100);
            entity.Property(e => e.RawResponseRef).HasMaxLength(500);
            entity.Property(e => e.RecordedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.KeywordId, e.CheckDate }).IsUnique();
            entity.HasIndex(e => new { e.ProjectId, e.CheckDate });

            entity.HasOne(e => e.Keyword)
                .WithMany(k => k.RankResults)
                .HasForeignKey(e => e.KeywordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.RankResults)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // ProjectSettings Configuration
        modelBuilder.Entity<ProjectSettings>(entity =>
        {
            entity.ToTable("ProjectSettings");
            entity.HasKey(e => e.ProjectId);
            entity.Property(e => e.CrawlUserAgent).HasMaxLength(255).HasDefaultValue("InternalSEOPlatformBot/1.0");
            entity.Property(e => e.RankTrackingFrequency).HasMaxLength(30).HasDefaultValue("Daily");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasOne(e => e.Project)
                .WithOne(p => p.Settings)
                .HasForeignKey<ProjectSettings>(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CrawlRun Configuration
        modelBuilder.Entity<CrawlRun>(entity =>
        {
            entity.ToTable("CrawlRuns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Queued");
            entity.Property(e => e.TriggerSource).IsRequired().HasMaxLength(50).HasDefaultValue("Manual");
            entity.Property(e => e.HealthScore).HasPrecision(5, 2);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.CreatedAt });

            entity.HasOne(e => e.Project)
                .WithMany(p => p.CrawlRuns)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // CrawlPage Configuration
        modelBuilder.Entity<CrawlPage>(entity =>
        {
            entity.ToTable("CrawlPages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Url).IsRequired().HasMaxLength(2048);
            entity.Property(e => e.UrlHash).IsRequired().HasMaxLength(64);
            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.Title).HasMaxLength(500);
            entity.Property(e => e.MetaDescription).HasMaxLength(1000);
            entity.Property(e => e.H1).HasMaxLength(500);
            entity.Property(e => e.CanonicalUrl).HasMaxLength(2048);
            entity.Property(e => e.IndexabilityStatus).HasMaxLength(100);
            entity.Property(e => e.CrawledAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.CrawlRunId, e.UrlHash });
            entity.HasIndex(e => new { e.ProjectId, e.UrlHash });

            entity.HasOne(e => e.CrawlRun)
                .WithMany(r => r.Pages)
                .HasForeignKey(e => e.CrawlRunId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.CrawlPages)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // AuditRule Configuration
        modelBuilder.Entity<AuditRule>(entity =>
        {
            entity.ToTable("AuditRules");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.DefaultSeverity).IsRequired().HasMaxLength(20).HasDefaultValue("Warning");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Recommendation).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // AuditIssue Configuration
        modelBuilder.Entity<AuditIssue>(entity =>
        {
            entity.ToTable("AuditIssues");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RuleCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Severity).IsRequired().HasMaxLength(20);
            entity.Property(e => e.AffectedUrl).IsRequired().HasMaxLength(2048);
            entity.Property(e => e.AffectedUrlHash).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Open");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.Status, e.Severity });
            entity.HasIndex(e => new { e.CrawlRunId, e.RuleCode });

            entity.HasOne(e => e.CrawlRun)
                .WithMany(r => r.Issues)
                .HasForeignKey(e => e.CrawlRunId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.AuditIssues)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Rule)
                .WithMany(r => r.Issues)
                .HasForeignKey(e => e.RuleCode)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // IssueEvidence Configuration
        modelBuilder.Entity<IssueEvidence>(entity =>
        {
            entity.ToTable("IssueEvidence");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.EvidenceType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EvidencePayload).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasOne(e => e.Issue)
                .WithMany(i => i.Evidence)
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Task Configuration
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Priority).IsRequired().HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Open");
            entity.Property(e => e.AffectedUrl).HasMaxLength(2048);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.Status, e.Priority }).HasDatabaseName("IX_Tasks_ProjectId_Status_Priority");
            entity.HasIndex(e => new { e.AssigneeId, e.Status }).HasDatabaseName("IX_Tasks_AssigneeId_Status");
            entity.HasIndex(e => e.SourceIssueId).HasDatabaseName("IX_Tasks_SourceIssueId");
            entity.HasIndex(e => e.CreatedBy).HasDatabaseName("IX_Tasks_CreatedBy");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SourceIssue)
                .WithMany(i => i.Tasks)
                .HasForeignKey(e => e.SourceIssueId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Assignee)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Creator)
                .WithMany(u => u.CreatedTasks)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskVerification Configuration
        modelBuilder.Entity<TaskVerification>(entity =>
        {
            entity.ToTable("TaskVerifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Queued");
            entity.Property(e => e.AttemptedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.TaskId, e.AttemptedAt }).HasDatabaseName("IX_TaskVerifications_TaskId_AttemptedAt");
            entity.HasIndex(e => e.VerifiedByRunId).HasDatabaseName("IX_TaskVerifications_VerifiedByRunId");
            entity.HasIndex(e => e.VerifiedByUserId).HasDatabaseName("IX_TaskVerifications_VerifiedByUserId");

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Verifications)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.VerifiedByRun)
                .WithMany()
                .HasForeignKey(e => e.VerifiedByRunId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.VerifiedByUser)
                .WithMany(u => u.TaskVerifications)
                .HasForeignKey(e => e.VerifiedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // TaskComment Configuration
        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.ToTable("TaskComments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CommentText).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.TaskId, e.CreatedAt }).HasDatabaseName("IX_TaskComments_TaskId_CreatedAt");
            entity.HasIndex(e => e.UserId).HasDatabaseName("IX_TaskComments_UserId");

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.TaskComments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // GoogleConnection Configuration
        modelBuilder.Entity<GoogleConnection>(entity =>
        {
            entity.ToTable("GoogleConnections");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(20).HasDefaultValue("GSC");
            entity.Property(e => e.PropertyIdentifier).IsRequired().HasMaxLength(255);
            entity.Property(e => e.AccountEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.EncryptedRefreshToken).IsRequired();
            entity.Property(e => e.SyncStatus).IsRequired().HasMaxLength(30).HasDefaultValue("Active");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.ServiceType }).IsUnique().HasDatabaseName("UQ_GoogleConnections_ProjectService");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.GoogleConnections)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GscDailyMetric Configuration
        modelBuilder.Entity<GscDailyMetric>(entity =>
        {
            entity.ToTable("GscDailyMetrics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Device).IsRequired().HasMaxLength(20).HasDefaultValue("ALL");
            entity.Property(e => e.Ctr).HasPrecision(7, 4);
            entity.Property(e => e.AveragePosition).HasPrecision(5, 2);
            entity.Property(e => e.SyncedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.MetricDate, e.Device }).IsUnique().HasDatabaseName("UQ_GscDailyMetrics");
            entity.HasIndex(e => new { e.ProjectId, e.MetricDate }).HasDatabaseName("IX_GscDailyMetrics_ProjectDate");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.GscDailyMetrics)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GscQueryMetric Configuration
        modelBuilder.Entity<GscQueryMetric>(entity =>
        {
            entity.ToTable("GscQueryMetrics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.QueryText).IsRequired().HasMaxLength(500);
            entity.Property(e => e.PageUrl).IsRequired().HasMaxLength(2048);
            entity.Property(e => e.CountryCode).IsRequired().HasMaxLength(3).HasDefaultValue("ALL");
            entity.Property(e => e.Device).IsRequired().HasMaxLength(20).HasDefaultValue("ALL");
            entity.Property(e => e.Ctr).HasPrecision(7, 4);
            entity.Property(e => e.Position).HasPrecision(5, 2);
            entity.Property(e => e.SyncedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.MetricDate, e.QueryText }).HasDatabaseName("IX_GscQueryMetrics_Project_Date_Query");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.GscQueryMetrics)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ReportRun Configuration
        modelBuilder.Entity<ReportRun>(entity =>
        {
            entity.ToTable("ReportRuns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ExecutiveSummary).HasMaxLength(4000);
            entity.Property(e => e.Sections).IsRequired().HasMaxLength(500);
            entity.Property(e => e.SnapshotJson).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.CreatedAt }).HasDatabaseName("IX_ReportRuns_ProjectId_CreatedAt");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.ReportRuns)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification Configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(250);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.Severity).IsRequired().HasMaxLength(20).HasDefaultValue("Info");
            entity.Property(e => e.EventType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TargetUrl).HasMaxLength(500);
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt })
                .HasDatabaseName("IX_Notifications_User_Read")
                .IsDescending(false, false, true);

            entity.HasIndex(e => e.ProjectId)
                .HasDatabaseName("IX_Notifications_ProjectId");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Notifications)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OAuthNonce Configuration
        modelBuilder.Entity<OAuthNonce>(entity =>
        {
            entity.ToTable("OAuthNonces");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.NonceHash).IsRequired().HasMaxLength(64);
            entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => e.NonceHash)
                .IsUnique()
                .HasDatabaseName("UQ_OAuthNonces_Hash");

            entity.HasIndex(e => new { e.NonceHash, e.ConsumedAt, e.ExpiresAt })
                .HasDatabaseName("IX_OAuthNonces_Lookup");

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Ga4DailyMetric Configuration
        modelBuilder.Entity<Ga4DailyMetric>(entity =>
        {
            entity.ToTable("Ga4DailyMetrics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.PropertyIdentifier).IsRequired().HasMaxLength(255);
            entity.Property(e => e.EngagementRate).HasPrecision(7, 4);
            entity.Property(e => e.Revenue).HasPrecision(18, 2);
            entity.Property(e => e.SyncedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.PropertyIdentifier, e.MetricDate })
                .IsUnique()
                .HasDatabaseName("UQ_Ga4DailyMetrics_Project_Property_Date");

            entity.HasIndex(e => new { e.ProjectId, e.PropertyIdentifier, e.MetricDate })
                .HasDatabaseName("IX_Ga4DailyMetrics_Project_Property_Date");

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Ga4LandingPageMetric Configuration
        modelBuilder.Entity<Ga4LandingPageMetric>(entity =>
        {
            entity.ToTable("Ga4LandingPageMetrics");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.PropertyIdentifier).IsRequired().HasMaxLength(255);
            entity.Property(e => e.LandingPage).IsRequired().HasMaxLength(2048).HasDefaultValue(string.Empty);
            entity.Property(e => e.EngagementRate).HasPrecision(7, 4);
            entity.Property(e => e.Revenue).HasPrecision(18, 2);
            entity.Property(e => e.SyncedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.PropertyIdentifier, e.MetricDate, e.LandingPage })
                .IsUnique()
                .HasDatabaseName("UQ_Ga4LandingPageMetrics_Project_Property_Date_Page");

            entity.HasIndex(e => new { e.ProjectId, e.PropertyIdentifier, e.MetricDate })
                .HasDatabaseName("IX_Ga4LandingPageMetrics_Project_Property_Date");

            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Competitor Configuration
        modelBuilder.Entity<Competitor>(entity =>
        {
            entity.ToTable("Competitors");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Domain).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.ProjectId, e.Domain })
                .IsUnique()
                .HasDatabaseName("UQ_Competitors_Project_Domain");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Competitors)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CompetitorRankResult Configuration
        modelBuilder.Entity<CompetitorRankResult>(entity =>
        {
            entity.ToTable("CompetitorRankResults");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.RankedUrl).HasMaxLength(2048);
            entity.Property(e => e.ProviderName).IsRequired().HasMaxLength(50).HasDefaultValue("development");
            entity.Property(e => e.RecordedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

            entity.HasIndex(e => new { e.CompetitorId, e.KeywordId, e.CheckDate })
                .IsUnique()
                .HasDatabaseName("UQ_CompetitorRankResults_Competitor_Keyword_Date");

            entity.HasIndex(e => new { e.ProjectId, e.CheckDate })
                .HasDatabaseName("IX_CompetitorRankResults_Project_Date");

            entity.HasOne(e => e.Competitor)
                .WithMany(c => c.RankResults)
                .HasForeignKey(e => e.CompetitorId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Keyword)
                .WithMany(k => k.CompetitorRankResults)
                .HasForeignKey(e => e.KeywordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.CompetitorRankResults)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
