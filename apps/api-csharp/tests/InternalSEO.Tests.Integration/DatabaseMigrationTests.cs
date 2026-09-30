using FluentAssertions;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InternalSEO.Tests.Integration;

public class DatabaseMigrationTests
{
    [Fact]
    public async Task MigrateAsync_ExecutesCleanlyOnSqlite()
    {
        var tempFile = Path.Combine(Path.GetTempPath(), $"test_mig_{Guid.NewGuid():N}.db");
        try
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite($"Data Source={tempFile}")
                .Options;

            using var context = new ApplicationDbContext(options);
            await context.Database.MigrateAsync();

            var appliedMigrations = (await context.Database.GetAppliedMigrationsAsync()).ToList();
            appliedMigrations.Should().HaveCount(10);
            appliedMigrations.Should().Contain(m => m.Contains("InitialCreate"));
            appliedMigrations.Should().Contain(m => m.Contains("AddRankResults"));
            appliedMigrations.Should().Contain(m => m.Contains("AddTechnicalAudit"));
            appliedMigrations.Should().Contain(m => m.Contains("AddTasksAndVerifications"));
            appliedMigrations.Should().Contain(m => m.Contains("AddGoogleSearchConsole"));
            appliedMigrations.Should().Contain(m => m.Contains("AddReportRuns"));
            appliedMigrations.Should().Contain(m => m.Contains("AddTaskComments"));
            appliedMigrations.Should().Contain(m => m.Contains("AddNotifications"));
            appliedMigrations.Should().Contain(m => m.Contains("AddGoogleAnalytics4"));
            appliedMigrations.Should().Contain(m => m.Contains("AddCompetitorTracking"));

            // Verify tables are queryable
            (await context.Projects.CountAsync()).Should().Be(0);
            (await context.Keywords.CountAsync()).Should().Be(0);
            (await context.RankResults.CountAsync()).Should().Be(0);
            (await context.CrawlRuns.CountAsync()).Should().Be(0);
            (await context.CrawlPages.CountAsync()).Should().Be(0);
            (await context.AuditIssues.CountAsync()).Should().Be(0);
            (await context.Tasks.CountAsync()).Should().Be(0);
            (await context.TaskVerifications.CountAsync()).Should().Be(0);
            (await context.GoogleConnections.CountAsync()).Should().Be(0);
            (await context.GscDailyMetrics.CountAsync()).Should().Be(0);
            (await context.GscQueryMetrics.CountAsync()).Should().Be(0);
            (await context.ReportRuns.CountAsync()).Should().Be(0);
            (await context.TaskComments.CountAsync()).Should().Be(0);
            (await context.Notifications.CountAsync()).Should().Be(0);
            (await context.Ga4DailyMetrics.CountAsync()).Should().Be(0);
            (await context.Ga4LandingPageMetrics.CountAsync()).Should().Be(0);
            (await context.OAuthNonces.CountAsync()).Should().Be(0);
            (await context.Competitors.CountAsync()).Should().Be(0);
            (await context.CompetitorRankResults.CountAsync()).Should().Be(0);
        }
        finally
        {
            Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
            if (File.Exists(tempFile))
            {
                File.Delete(tempFile);
            }
        }
    }
}
