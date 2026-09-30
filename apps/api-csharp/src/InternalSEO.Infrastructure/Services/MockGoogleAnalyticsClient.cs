using System.Net;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class MockGoogleAnalyticsClient : IGoogleAnalyticsClient
{
    private readonly ILogger<MockGoogleAnalyticsClient> _logger;

    public MockGoogleAnalyticsClient(ILogger<MockGoogleAnalyticsClient> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<Ga4Property>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        if (accessToken.Contains("invalid", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Mock GA4 API failed: invalid access token.");
        }

        IReadOnlyList<Ga4Property> properties = new List<Ga4Property>
        {
            new("properties/12345678", "Production Web - GA4", "Acme Enterprise"),
            new("properties/87654321", "Blog & Content Hub", "Acme Enterprise"),
            new("properties/99887766", "Staging & E-Commerce", "Acme Labs")
        };

        return Task.FromResult(properties);
    }

    public Task<Ga4FetchDataResult> FetchPerformanceDataAsync(
        string accessToken,
        string propertyIdentifier,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (propertyIdentifier.Contains("fail-property", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(new Ga4FetchDataResult(
                Success: false,
                ErrorMessage: "GA4 Data API error: property not found or permission denied.",
                DailyMetrics: Array.Empty<Ga4DailyMetricRecord>(),
                LandingPageMetrics: Array.Empty<Ga4LandingPageMetricRecord>(),
                StatusCode: HttpStatusCode.Forbidden,
                IsAuthenticationFailure: true
            ));
        }

        if (accessToken.Contains("revoked", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(new Ga4FetchDataResult(
                Success: false,
                ErrorMessage: "GA4 authorization revoked or expired.",
                DailyMetrics: Array.Empty<Ga4DailyMetricRecord>(),
                LandingPageMetrics: Array.Empty<Ga4LandingPageMetricRecord>(),
                StatusCode: HttpStatusCode.Unauthorized,
                IsAuthenticationFailure: true
            ));
        }

        var dailyRecords = new List<Ga4DailyMetricRecord>();
        var landingPageRecords = new List<Ga4LandingPageMetricRecord>();

        var samplePages = new[]
        {
            ("/", 450, 380, 0.6850m, 18, 1250.00m),
            ("/products/rank-tracker", 280, 240, 0.6200m, 12, 890.50m),
            ("/features/seo-platform", 190, 160, 0.6100m, 8, 540.00m),
            ("/audit/technical-seo", 140, 120, 0.5900m, 5, 320.00m),
            ("/tasks/verification", 95, 80, 0.5800m, 3, 210.00m),
            ("/pricing", 85, 75, 0.7200m, 7, 750.00m),
            ("/about", 60, 50, 0.5100m, 1, 0.00m)
        };

        var current = startDate;
        int dayIndex = 0;
        while (current <= endDate)
        {
            int baseSessions = 1300 + (dayIndex * 35);
            int baseUsers = 1050 + (dayIndex * 28); // Property-level distinct active users (NOT sum of pages)
            decimal baseEngagement = 0.6350m;
            int baseConversions = 54 + (dayIndex * 2);
            decimal baseRevenue = 3960.50m + (dayIndex * 150.00m);

            dailyRecords.Add(new Ga4DailyMetricRecord(
                MetricDate: current,
                Sessions: baseSessions,
                ActiveUsers: baseUsers,
                EngagementRate: baseEngagement,
                Conversions: baseConversions,
                Revenue: baseRevenue
            ));

            foreach (var page in samplePages)
            {
                landingPageRecords.Add(new Ga4LandingPageMetricRecord(
                    MetricDate: current,
                    LandingPage: page.Item1,
                    Sessions: page.Item2 + (dayIndex * 5),
                    ActiveUsers: page.Item3 + (dayIndex * 4),
                    EngagementRate: page.Item4,
                    Conversions: page.Item5,
                    Revenue: page.Item6
                ));
            }

            current = current.AddDays(1);
            dayIndex++;
        }

        return Task.FromResult(new Ga4FetchDataResult(
            Success: true,
            ErrorMessage: null,
            DailyMetrics: dailyRecords,
            LandingPageMetrics: landingPageRecords,
            StatusCode: HttpStatusCode.OK,
            IsAuthenticationFailure: false
        ));
    }
}
