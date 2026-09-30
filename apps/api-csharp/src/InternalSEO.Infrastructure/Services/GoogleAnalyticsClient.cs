using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class GoogleAnalyticsClient : IGoogleAnalyticsClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GoogleAnalyticsClient> _logger;

    public GoogleAnalyticsClient(HttpClient httpClient, ILogger<GoogleAnalyticsClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IReadOnlyList<Ga4Property>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "https://analyticsadmin.googleapis.com/v1beta/accountSummaries");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("GA4 accountSummaries failed with status {StatusCode}", response.StatusCode);
            throw new InvalidOperationException($"Failed to retrieve Google Analytics 4 properties: {response.StatusCode}");
        }

        var payload = await response.Content.ReadFromJsonAsync<Ga4AccountSummariesResponse>(cancellationToken: cancellationToken);
        if (payload?.AccountSummaries == null || payload.AccountSummaries.Count == 0)
        {
            return Array.Empty<Ga4Property>();
        }

        var list = new List<Ga4Property>();
        foreach (var account in payload.AccountSummaries)
        {
            if (account.PropertySummaries != null)
            {
                foreach (var prop in account.PropertySummaries)
                {
                    list.Add(new Ga4Property(
                        PropertyIdentifier: prop.Property ?? string.Empty,
                        DisplayName: prop.DisplayName ?? "Unnamed Property",
                        AccountName: account.DisplayName
                    ));
                }
            }
        }

        return list;
    }

    public async Task<Ga4FetchDataResult> FetchPerformanceDataAsync(
        string accessToken,
        string propertyIdentifier,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Normalize property resource name (ensure "properties/" prefix)
            var cleanProp = propertyIdentifier.Trim();
            if (!cleanProp.StartsWith("properties/", StringComparison.OrdinalIgnoreCase) && long.TryParse(cleanProp, out _))
            {
                cleanProp = $"properties/{cleanProp}";
            }

            var url = $"https://analyticsdata.googleapis.com/v1beta/{cleanProp}:runReport";

            var dateRangeObj = new { startDate = startDate.ToString("yyyy-MM-dd"), endDate = endDate.ToString("yyyy-MM-dd") };
            var filterObj = new
            {
                filter = new
                {
                    fieldName = "sessionDefaultChannelGroup",
                    stringFilter = new { matchType = "EXACT", value = "Organic Search" }
                }
            };
            var metricList = new[]
            {
                new { name = "sessions" },
                new { name = "activeUsers" },
                new { name = "engagementRate" },
                new { name = "conversions" },
                new { name = "totalRevenue" }
            };

            // 1. Fetch Property-Level Daily Summary (Dimension: date)
            var propertyDailyRequest = new
            {
                dateRanges = new[] { dateRangeObj },
                dimensions = new[] { new { name = "date" } },
                metrics = metricList,
                dimensionFilter = filterObj
            };

            using var propReqMsg = new HttpRequestMessage(HttpMethod.Post, url);
            propReqMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            propReqMsg.Content = JsonContent.Create(propertyDailyRequest);

            var propRes = await _httpClient.SendAsync(propReqMsg, cancellationToken);
            if (!propRes.IsSuccessStatusCode)
            {
                _logger.LogError("GA4 property-level report failed with status {StatusCode}", propRes.StatusCode);
                bool isAuthFail = propRes.StatusCode == HttpStatusCode.Unauthorized || propRes.StatusCode == HttpStatusCode.Forbidden;
                return new Ga4FetchDataResult(
                    Success: false,
                    ErrorMessage: $"GA4 Data API returned error status: {propRes.StatusCode}",
                    DailyMetrics: Array.Empty<Ga4DailyMetricRecord>(),
                    LandingPageMetrics: Array.Empty<Ga4LandingPageMetricRecord>(),
                    StatusCode: propRes.StatusCode,
                    IsAuthenticationFailure: isAuthFail
                );
            }

            var propPayload = await propRes.Content.ReadFromJsonAsync<Ga4RunReportResponse>(cancellationToken: cancellationToken);
            var dailyRecords = new List<Ga4DailyMetricRecord>();
            if (propPayload?.Rows != null)
            {
                foreach (var row in propPayload.Rows)
                {
                    if (row.DimensionValues?.Count > 0 && row.MetricValues?.Count >= 5)
                    {
                        var rawDate = row.DimensionValues[0].Value;
                        if (DateOnly.TryParseExact(rawDate, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateParsed))
                        {
                            int.TryParse(row.MetricValues[0].Value, out var s);
                            int.TryParse(row.MetricValues[1].Value, out var u);
                            decimal.TryParse(row.MetricValues[2].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var e);
                            int.TryParse(row.MetricValues[3].Value, out var c);
                            decimal.TryParse(row.MetricValues[4].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var r);

                            dailyRecords.Add(new Ga4DailyMetricRecord(dateParsed, s, u, e, c, r));
                        }
                    }
                }
            }

            // 2. Fetch Landing-Page-Level Breakdown (Dimensions: date, landingPage)
            var landingPageRequest = new
            {
                dateRanges = new[] { dateRangeObj },
                dimensions = new[] { new { name = "date" }, new { name = "landingPage" } },
                metrics = metricList,
                dimensionFilter = filterObj,
                limit = 2500
            };

            using var pageReqMsg = new HttpRequestMessage(HttpMethod.Post, url);
            pageReqMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            pageReqMsg.Content = JsonContent.Create(landingPageRequest);

            var pageRes = await _httpClient.SendAsync(pageReqMsg, cancellationToken);
            if (!pageRes.IsSuccessStatusCode)
            {
                _logger.LogError("GA4 landing-page report failed with status {StatusCode}", pageRes.StatusCode);
                bool isAuthFail = pageRes.StatusCode == HttpStatusCode.Unauthorized || pageRes.StatusCode == HttpStatusCode.Forbidden;
                return new Ga4FetchDataResult(
                    Success: false,
                    ErrorMessage: $"GA4 Data API returned error status for landing pages: {pageRes.StatusCode}",
                    DailyMetrics: dailyRecords,
                    LandingPageMetrics: Array.Empty<Ga4LandingPageMetricRecord>(),
                    StatusCode: pageRes.StatusCode,
                    IsAuthenticationFailure: isAuthFail
                );
            }

            var pagePayload = await pageRes.Content.ReadFromJsonAsync<Ga4RunReportResponse>(cancellationToken: cancellationToken);
            var landingPageRecords = new List<Ga4LandingPageMetricRecord>();
            if (pagePayload?.Rows != null)
            {
                foreach (var row in pagePayload.Rows)
                {
                    if (row.DimensionValues?.Count >= 2 && row.MetricValues?.Count >= 5)
                    {
                        var rawDate = row.DimensionValues[0].Value;
                        var rawPage = row.DimensionValues[1].Value ?? string.Empty;

                        if (DateOnly.TryParseExact(rawDate, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateParsed))
                        {
                            int.TryParse(row.MetricValues[0].Value, out var s);
                            int.TryParse(row.MetricValues[1].Value, out var u);
                            decimal.TryParse(row.MetricValues[2].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var e);
                            int.TryParse(row.MetricValues[3].Value, out var c);
                            decimal.TryParse(row.MetricValues[4].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var r);

                            landingPageRecords.Add(new Ga4LandingPageMetricRecord(dateParsed, rawPage, s, u, e, c, r));
                        }
                    }
                }
            }

            return new Ga4FetchDataResult(
                Success: true,
                ErrorMessage: null,
                DailyMetrics: dailyRecords,
                LandingPageMetrics: landingPageRecords,
                StatusCode: HttpStatusCode.OK,
                IsAuthenticationFailure: false
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception querying Google Analytics Data API for property {Property}", propertyIdentifier);
            return new Ga4FetchDataResult(
                Success: false,
                ErrorMessage: ex.Message,
                DailyMetrics: Array.Empty<Ga4DailyMetricRecord>(),
                LandingPageMetrics: Array.Empty<Ga4LandingPageMetricRecord>()
            );
        }
    }

    private class Ga4AccountSummariesResponse
    {
        [JsonPropertyName("accountSummaries")]
        public List<Ga4AccountSummary>? AccountSummaries { get; set; }
    }

    private class Ga4AccountSummary
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }

        [JsonPropertyName("propertySummaries")]
        public List<Ga4PropertySummary>? PropertySummaries { get; set; }
    }

    private class Ga4PropertySummary
    {
        [JsonPropertyName("property")]
        public string? Property { get; set; }

        [JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }
    }

    private class Ga4RunReportResponse
    {
        [JsonPropertyName("rows")]
        public List<Ga4ReportRow>? Rows { get; set; }
    }

    private class Ga4ReportRow
    {
        [JsonPropertyName("dimensionValues")]
        public List<Ga4DimensionValue>? DimensionValues { get; set; }

        [JsonPropertyName("metricValues")]
        public List<Ga4MetricValue>? MetricValues { get; set; }
    }

    private class Ga4DimensionValue
    {
        [JsonPropertyName("value")]
        public string? Value { get; set; }
    }

    private class Ga4MetricValue
    {
        [JsonPropertyName("value")]
        public string? Value { get; set; }
    }
}
