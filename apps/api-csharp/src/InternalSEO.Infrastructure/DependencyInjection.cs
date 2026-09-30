using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Persistence.Seed;
using InternalSEO.Infrastructure.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InternalSEO.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=(localdb)\\mssqllocaldb;Database=InternalSEO_Dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        var provider = configuration["Database:Provider"] ?? "SqlServer";

        if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            var resolvedConnectionString = ResolveSqliteConnectionString(connectionString);
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(resolvedConnectionString));
        }
        else
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
                }));
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IPasswordHasherService, PasswordHasherService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IActivityLogger, ActivityLogger>();
        services.AddScoped<IRankTrackingProvider, DevelopmentRankTrackingProvider>();
        services.AddScoped<ISsrfValidator, SsrfValidator>();
        services.AddScoped<IUrlNormalizer, UrlNormalizer>();
        services.AddScoped<IWebCrawlerService, WebCrawlerService>();
        services.AddScoped<IAuditRuleEvaluator, AuditRuleEvaluator>();
        services.AddScoped<ICrawlJobRunner, CrawlJobRunner>();
        services.AddScoped<ICrawlJobEnqueuer, HangfireCrawlJobEnqueuer>();
        services.AddScoped<IIssueVerificationEvaluator, IssueVerificationEvaluator>();
        services.AddScoped<ITaskVerificationRunner, TaskVerificationJobRunner>();
        services.AddScoped<ITaskVerificationEnqueuer, HangfireTaskVerificationEnqueuer>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITaskOverdueScanner, TaskOverdueScanner>();
        services.AddScoped<IRankTrackingJobRunner, RankTrackingJobRunner>();

        // Google, GSC & GA4 Services
        services.AddDataProtection()
            .SetApplicationName("InternalSEOPlatform");
        services.AddScoped<ITokenEncryptionService, DataProtectionTokenEncryptionService>();
        services.AddScoped<IOAuthNonceService, OAuthNonceService>();

        var useMockGoogle = configuration.GetValue<bool>("Google:UseMockProvider", true);
        if (useMockGoogle)
        {
            services.AddScoped<MockGoogleSearchConsoleClient>();
            services.AddScoped<IGoogleAuthService>(sp => sp.GetRequiredService<MockGoogleSearchConsoleClient>());
            services.AddScoped<IGoogleSearchConsoleClient>(sp => sp.GetRequiredService<MockGoogleSearchConsoleClient>());
            services.AddScoped<IGoogleAnalyticsClient, MockGoogleAnalyticsClient>();
        }
        else
        {
            services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();
            services.AddHttpClient<IGoogleSearchConsoleClient, GoogleSearchConsoleClient>();
            services.AddHttpClient<IGoogleAnalyticsClient, GoogleAnalyticsClient>();
        }

        services.AddScoped<IGscSyncRunner, GscSyncJobRunner>();
        services.AddScoped<IGscSyncEnqueuer, HangfireGscSyncEnqueuer>();
        services.AddScoped<IGa4SyncRunner, Ga4SyncJobRunner>();
        services.AddScoped<IGa4SyncEnqueuer, HangfireGa4SyncEnqueuer>();

        services.AddScoped<DbInitializer>();

        return services;
    }

    public static string ResolveSqliteFilePath(string fileNameOrPath)
    {
        if (string.IsNullOrWhiteSpace(fileNameOrPath))
            return fileNameOrPath;

        var cleanPath = fileNameOrPath;
        if (cleanPath.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
        {
            cleanPath = cleanPath.Substring("Data Source=".Length).TrimEnd(';').Trim();
        }

        if (Path.IsPathRooted(cleanPath))
            return cleanPath;

        // Search upward for solution root (InternalSEOPlatform.sln)
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "InternalSEOPlatform.sln")))
        {
            dir = dir.Parent;
        }

        var baseDir = dir?.FullName ?? Directory.GetCurrentDirectory();
        return Path.Combine(baseDir, cleanPath);
    }

    public static string ResolveSqliteConnectionString(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString) || !connectionString.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase))
            return connectionString;

        var filePath = ResolveSqliteFilePath(connectionString);
        return $"Data Source={filePath};";
    }
}
