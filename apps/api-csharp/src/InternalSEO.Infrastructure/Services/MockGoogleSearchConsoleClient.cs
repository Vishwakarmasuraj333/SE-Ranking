using System.Net;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class MockGoogleSearchConsoleClient : IGoogleAuthService, IGoogleSearchConsoleClient
{
    private readonly ILogger<MockGoogleSearchConsoleClient> _logger;

    public MockGoogleSearchConsoleClient(ILogger<MockGoogleSearchConsoleClient> logger)
    {
        _logger = logger;
    }

    public string GenerateAuthorizationUrl(Guid projectId, string state, string? scope = null)
    {
        var resolvedScope = scope ?? "https://www.googleapis.com/auth/webmasters.readonly";
        return $"https://accounts.google.com/o/oauth2/v2/auth?client_id=mock-client-id&redirect_uri=mock-callback&response_type=code&scope={Uri.EscapeDataString(resolvedScope)}&state={state}&access_type=offline&prompt=consent";
    }

    public Task<GoogleTokenExchangeResult> ExchangeAuthorizationCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
    {
        if (code == "invalid-code")
        {
            throw new InvalidOperationException("Mock OAuth exchange failed: invalid authorization code.");
        }

        var result = new GoogleTokenExchangeResult(
            AccessToken: $"mock_access_token_{Guid.NewGuid():N}",
            RefreshToken: $"mock_refresh_token_{Guid.NewGuid():N}",
            ExpiresInSeconds: 3600,
            AccountEmail: "seo-admin@example.com",
            Scope: "https://www.googleapis.com/auth/webmasters.readonly"
        );

        return Task.FromResult(result);
    }

    public Task<GoogleTokenRefreshResult> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (refreshToken.Contains("revoked", StringComparison.OrdinalIgnoreCase))
        {
            throw new GoogleOAuthException("Mock OAuth token refresh failed: token has been revoked.", HttpStatusCode.BadRequest, "invalid_grant", isAuthFailure: true);
        }

        var result = new GoogleTokenRefreshResult(
            AccessToken: $"mock_refreshed_token_{Guid.NewGuid():N}",
            ExpiresInSeconds: 3600
        );

        return Task.FromResult(result);
    }

    public Task<IReadOnlyList<GscProperty>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        if (accessToken.Contains("invalid", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Mock GSC API failed: invalid access token.");
        }

        IReadOnlyList<GscProperty> properties = new List<GscProperty>
        {
            new("sc-domain:example.com", "siteOwner", "sc-domain:example.com"),
            new("https://example.com/", "siteOwner", "https://example.com/"),
            new("https://sub.example.com/", "siteFullUser", "https://sub.example.com/"),
            new("sc-domain:acme-corp.com", "siteOwner", "sc-domain:acme-corp.com")
        };

        return Task.FromResult(properties);
    }

    public Task<GscFetchDataResult> FetchPerformanceDataAsync(
        string accessToken,
        string propertyIdentifier,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (propertyIdentifier.Contains("fail-property", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(new GscFetchDataResult(
                Success: false,
                ErrorMessage: "GSC API error: property not found or permission denied.",
                DailyMetrics: Array.Empty<GscDailyMetricRecord>(),
                QueryMetrics: Array.Empty<GscQueryMetricRecord>(),
                StatusCode: HttpStatusCode.Forbidden,
                IsAuthenticationFailure: true
            ));
        }

        var dailyRecords = new List<GscDailyMetricRecord>();
        var queryRecords = new List<GscQueryMetricRecord>();

        var devices = new[] { "ALL", "DESKTOP", "MOBILE", "TABLET" };
        var sampleQueries = new[]
        {
            ("enterprise seo platform", "/features/seo-platform", "USA", 1250, 18400, 3.2m),
            ("best rank tracking tool", "/products/rank-tracker", "USA", 840, 12200, 4.8m),
            ("website technical crawler", "/audit/technical-seo", "GBR", 620, 9500, 2.7m),
            ("automated task verification", "/tasks/verification", "CAN", 410, 6800, 5.1m),
            ("google search console sync", "/integrations/gsc", "USA", 390, 5400, 6.4m),
            ("internal seo operations software", "/about", "DEU", 280, 4200, 8.2m),
            ("serp feature parser", "/features/serp-parser", "AUS", 190, 3100, 9.5m),
            ("closed loop seo remediation", "/workflow/remediation", "USA", 150, 2800, 11.3m)
        };

        var current = startDate;
        while (current <= endDate)
        {
            var daySeed = current.DayNumber;

            // Generate daily summary for each device
            var allClicks = 3200 + (daySeed % 500);
            var allImpressions = 45000 + (daySeed % 7000);
            var allCtr = Math.Round((decimal)allClicks / allImpressions, 4);
            var allAvgPos = Math.Round(5.4m + ((daySeed % 10) * 0.1m), 2);

            dailyRecords.Add(new GscDailyMetricRecord(current, "ALL", allClicks, allImpressions, allCtr, allAvgPos));

            var desktopClicks = (int)(allClicks * 0.60);
            var desktopImpressions = (int)(allImpressions * 0.55);
            dailyRecords.Add(new GscDailyMetricRecord(current, "DESKTOP", desktopClicks, desktopImpressions, Math.Round((decimal)desktopClicks / desktopImpressions, 4), Math.Round(allAvgPos - 0.3m, 2)));

            var mobileClicks = (int)(allClicks * 0.35);
            var mobileImpressions = (int)(allImpressions * 0.40);
            dailyRecords.Add(new GscDailyMetricRecord(current, "MOBILE", mobileClicks, mobileImpressions, Math.Round((decimal)mobileClicks / mobileImpressions, 4), Math.Round(allAvgPos + 0.4m, 2)));

            var tabletClicks = allClicks - desktopClicks - mobileClicks;
            var tabletImpressions = allImpressions - desktopImpressions - mobileImpressions;
            dailyRecords.Add(new GscDailyMetricRecord(current, "TABLET", tabletClicks, tabletImpressions, tabletImpressions > 0 ? Math.Round((decimal)tabletClicks / tabletImpressions, 4) : 0, Math.Round(allAvgPos + 0.1m, 2)));

            // Generate query level items
            foreach (var (q, page, country, baseClicks, baseImp, basePos) in sampleQueries)
            {
                var qClicks = baseClicks + (daySeed % 40);
                var qImp = baseImp + (daySeed % 400);
                var qCtr = qImp > 0 ? Math.Round((decimal)qClicks / qImp, 4) : 0;
                var qPos = basePos + ((daySeed % 5) * 0.1m);

                queryRecords.Add(new GscQueryMetricRecord(
                    MetricDate: current,
                    QueryText: q,
                    PageUrl: page,
                    CountryCode: country,
                    Device: "ALL",
                    Clicks: qClicks,
                    Impressions: qImp,
                    Ctr: qCtr,
                    Position: Math.Round(qPos, 2)
                ));
            }

            current = current.AddDays(1);
        }

        return Task.FromResult(new GscFetchDataResult(
            Success: true,
            ErrorMessage: null,
            DailyMetrics: dailyRecords,
            QueryMetrics: queryRecords
        ));
    }
}
