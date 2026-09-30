using System.Net;
using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Primitives;
using Xunit;

namespace InternalSEO.Tests.Integration;

public class CrawlExecutionIntegrationTests : IAsyncLifetime
{
    private HttpListener? _listener;
    private Task? _listenerTask;
    private readonly CancellationTokenSource _cts = new();
    private const int TestPort = 5055;
    private readonly string _baseUrl = $"http://127.0.0.1:{TestPort}/";

    public Task InitializeAsync()
    {
        _listener = new HttpListener();
        _listener.Prefixes.Add(_baseUrl);
        _listener.Start();

        _listenerTask = Task.Run(async () =>
        {
            while (!_cts.Token.IsCancellationRequested && _listener.IsListening)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    var path = context.Request.Url?.AbsolutePath ?? "/";

                    string responseString;
                    int statusCode = 200;

                    if (path == "/")
                    {
                        statusCode = 200;
                        responseString = "<html><head><title>Home</title><meta name=\"description\" content=\"Home Desc\"><link rel=\"canonical\" href=\"http://127.0.0.1:5055/\"></head><body><h1>Welcome</h1><a href=\"/page2\">Page 2</a><a href=\"/missing\">Broken Link</a></body></html>";
                    }
                    else if (path == "/page2")
                    {
                        statusCode = 200;
                        responseString = "<html><head><title>Page Two</title></head><body><h1>Page 2</h1><a href=\"/\">Home</a></body></html>";
                    }
                    else
                    {
                        statusCode = 404;
                        responseString = "<html><head><title>Not Found</title></head><body>404 Not Found</body></html>";
                    }

                    context.Response.StatusCode = statusCode;
                    context.Response.ContentType = "text/html; charset=utf-8";
                    var buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
                    context.Response.ContentLength64 = buffer.Length;
                    await context.Response.OutputStream.WriteAsync(buffer);
                    context.Response.Close();
                }
                catch (HttpListenerException) { break; }
                catch (ObjectDisposedException) { break; }
            }
        });

        return Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _cts.Cancel();
        _listener?.Stop();
        _listener?.Close();
        if (_listenerTask != null)
        {
            try { await _listenerTask; } catch { }
        }
    }

    [Fact]
    public async Task CrawlJobRunner_ExecutesFullPipeline_WithPersistentPagesAndIssues()
    {
        var tempFile = Path.Combine(Path.GetTempPath(), $"test_crawl_{Guid.NewGuid():N}.db");
        try
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite($"Data Source={tempFile}")
                .Options;

            using var dbContext = new ApplicationDbContext(options);
            await dbContext.Database.MigrateAsync();

            // Seed AuditRules
            var auditRules = new List<AuditRule>
            {
                new() { Id = "RULE-HTTP-404", Category = "Indexability", DefaultSeverity = "Error", Title = "Page Returns HTTP 404 (Not Found)", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-HTTP-5XX", Category = "Indexability", DefaultSeverity = "Error", Title = "Page Returns HTTP 5xx Server Error", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-TITLE-MISSING", Category = "Content", DefaultSeverity = "Error", Title = "Missing <title> Tag", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-TITLE-DUPLICATE", Category = "Content", DefaultSeverity = "Error", Title = "Duplicate <title> Tag", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-META-DESC-MISSING", Category = "Content", DefaultSeverity = "Warning", Title = "Missing Meta Description", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-CANONICAL-MISSING", Category = "Indexability", DefaultSeverity = "Warning", Title = "Missing Canonical URL", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-BROKEN-INTERNAL-LINK", Category = "Links", DefaultSeverity = "Error", Title = "Broken Internal Hyperlink", Description = "Desc", Recommendation = "Rec" },
                new() { Id = "RULE-REDIRECT-FOUND", Category = "Links", DefaultSeverity = "Notice", Title = "Internal URL Returns HTTP 3xx Redirect", Description = "Desc", Recommendation = "Rec" }
            };
            dbContext.AuditRules.AddRange(auditRules);

            // Seed user and project
            var userId = Guid.NewGuid();
            var user = new User
            {
                Id = userId,
                Email = "test@internal.local",
                NormalizedEmail = "TEST@INTERNAL.LOCAL",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = "hash"
            };
            dbContext.Users.Add(user);

            var projectId = Guid.NewGuid();
            var project = new Project
            {
                Id = projectId,
                Name = "Test Loopback Project",
                PrimaryDomain = $"127.0.0.1:{TestPort}",
                Protocol = "http://",
                Status = ProjectStatus.Active,
                CreatedBy = userId,
                Settings = new ProjectSettings
                {
                    ProjectId = projectId,
                    CrawlMaxPages = 10,
                    CrawlMaxDepth = 3,
                    CrawlRateLimitMs = 0,
                    CrawlUserAgent = "TestRunner/1.0"
                }
            };
            dbContext.Projects.Add(project);

            var crawlRun = new CrawlRun
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Status = "Queued",
                TriggerSource = "Manual"
            };
            dbContext.CrawlRuns.Add(crawlRun);
            await dbContext.SaveChangesAsync();

            // Configure test harness SsrfValidator
            var config = new TestConfiguration();
            var ssrfValidator = new SsrfValidator(config);
            var urlNormalizer = new UrlNormalizer();
            var crawlerService = new WebCrawlerService(ssrfValidator, urlNormalizer, NullLogger<WebCrawlerService>.Instance);
            var auditEvaluator = new AuditRuleEvaluator(urlNormalizer);
            var stubActivityLogger = new StubActivityLogger();

            var notificationService = new NotificationService(dbContext, NullLogger<NotificationService>.Instance);
            var runner = new CrawlJobRunner(dbContext, crawlerService, auditEvaluator, stubActivityLogger, notificationService, NullLogger<CrawlJobRunner>.Instance);

            // Execute Crawl
            await runner.ExecuteCrawlAsync(crawlRun.Id, CancellationToken.None);

            // Verify CrawlRun results
            var updatedRun = await dbContext.CrawlRuns.FirstAsync(r => r.Id == crawlRun.Id);
            updatedRun.Status.Should().Be("Completed");
            updatedRun.UrlsCrawled.Should().Be(3);
            updatedRun.UrlsDiscovered.Should().BeGreaterOrEqualTo(3);
            updatedRun.ErrorsCount.Should().Be(2); // 404 and Broken Internal Link
            updatedRun.WarningsCount.Should().Be(2); // Missing meta description and missing canonical on page2
            updatedRun.HealthScore.Should().Be(0.0m); // Penalty: (2*1.5 + 2*0.5)/3 * 100 = 133.3 -> Clamped to 0

            // Verify persisted CrawlPages
            var pages = await dbContext.CrawlPages.Where(p => p.CrawlRunId == crawlRun.Id).ToListAsync();
            pages.Should().HaveCount(3);
            pages.Should().Contain(p => p.Url == $"http://127.0.0.1:{TestPort}/" && p.HttpStatusCode == 200 && p.Title == "Home");
            pages.Should().Contain(p => p.Url == $"http://127.0.0.1:{TestPort}/page2" && p.HttpStatusCode == 200 && p.Title == "Page Two");
            pages.Should().Contain(p => p.Url == $"http://127.0.0.1:{TestPort}/missing" && p.HttpStatusCode == 404);

            // Verify persisted AuditIssues & Evidence
            var issues = await dbContext.AuditIssues.Include(i => i.Evidence).Where(i => i.CrawlRunId == crawlRun.Id).ToListAsync();
            issues.Should().NotBeEmpty();
            issues.Should().Contain(i => i.RuleCode == "RULE-HTTP-404");
            issues.Should().Contain(i => i.RuleCode == "RULE-META-DESC-MISSING");
            issues.Should().Contain(i => i.RuleCode == "RULE-CANONICAL-MISSING");
            issues.Should().Contain(i => i.RuleCode == "RULE-BROKEN-INTERNAL-LINK");

            var evidence = issues.SelectMany(i => i.Evidence).ToList();
            evidence.Should().NotBeEmpty();
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

    private class TestConfiguration : IConfiguration
    {
        private readonly Dictionary<string, string> _values = new()
        {
            ["Crawler:AllowLoopbackTestHarness"] = "true",
            ["Crawler:TestHarnessPort"] = "5055"
        };

        public string? this[string key]
        {
            get => _values.GetValueOrDefault(key);
            set { if (value != null) _values[key] = value; }
        }

        public IEnumerable<IConfigurationSection> GetChildren() => Enumerable.Empty<IConfigurationSection>();
        public IChangeToken GetReloadToken() => throw new NotImplementedException();
        public IConfigurationSection GetSection(string key) => throw new NotImplementedException();
    }

    private class StubActivityLogger : IActivityLogger
    {
        public Task LogAsync(string actionType, string entityType, string entityId, Guid? projectId = null, object? payload = null, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task LogAsync(string actionType, string entityType, string entityId, Guid? projectId = null, object? payload = null, Guid? actorId = null, string? actorEmail = null, string? actorRole = null, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
