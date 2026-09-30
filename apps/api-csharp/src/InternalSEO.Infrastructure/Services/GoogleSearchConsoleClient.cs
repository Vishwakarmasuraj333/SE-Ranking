using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class GoogleSearchConsoleClient : IGoogleSearchConsoleClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GoogleSearchConsoleClient> _logger;

    public GoogleSearchConsoleClient(
        HttpClient httpClient,
        ILogger<GoogleSearchConsoleClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IReadOnlyList<GscProperty>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/webmasters/v3/sites");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("GSC GetAccessibleProperties failed with status {StatusCode}", response.StatusCode);
            throw new InvalidOperationException($"Failed to retrieve Search Console properties: {response.StatusCode}");
        }

        var payload = await response.Content.ReadFromJsonAsync<GscSitesResponse>(cancellationToken: cancellationToken);
        if (payload?.SiteEntry == null || payload.SiteEntry.Count == 0)
        {
            return Array.Empty<GscProperty>();
        }

        return payload.SiteEntry.Select(s => new GscProperty(
            PropertyIdentifier: s.SiteUrl ?? string.Empty,
            PermissionLevel: s.PermissionLevel ?? "siteFullUser",
            SiteUrl: s.SiteUrl
        )).ToList();
    }

    public async Task<GscFetchDataResult> FetchPerformanceDataAsync(
        string accessToken,
        string propertyIdentifier,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedSiteUrl = Uri.EscapeDataString(propertyIdentifier);
            var url = $"https://www.googleapis.com/webmasters/v3/sites/{encodedSiteUrl}/searchAnalytics/query";

            // 1. Fetch Daily summaries by device
            var dailyMetrics = new List<GscDailyMetricRecord>();
            var dailyReqBody = new
            {
                startDate = startDate.ToString("yyyy-MM-dd"),
                endDate = endDate.ToString("yyyy-MM-dd"),
                dimensions = new[] { "date", "device" },
                rowLimit = 5000
            };

            using var dailyReq = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(dailyReqBody)
            };
            dailyReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var dailyRes = await _httpClient.SendAsync(dailyReq, cancellationToken);
            if (!dailyRes.IsSuccessStatusCode)
            {
                _logger.LogError("GSC daily metrics request failed with status {StatusCode}", dailyRes.StatusCode);
                bool isAuth = dailyRes.StatusCode == System.Net.HttpStatusCode.Unauthorized || dailyRes.StatusCode == System.Net.HttpStatusCode.Forbidden;
                return new GscFetchDataResult(false, $"GSC API returned status {dailyRes.StatusCode}", Array.Empty<GscDailyMetricRecord>(), Array.Empty<GscQueryMetricRecord>(), dailyRes.StatusCode, isAuth);
            }

            var dailyData = await dailyRes.Content.ReadFromJsonAsync<GscQueryResponse>(cancellationToken: cancellationToken);
            if (dailyData?.Rows != null)
            {
                foreach (var row in dailyData.Rows)
                {
                    if (row.Keys != null && row.Keys.Count >= 2 && DateOnly.TryParse(row.Keys[0], out var d))
                    {
                        var device = row.Keys[1].ToUpperInvariant();
                        dailyMetrics.Add(new GscDailyMetricRecord(
                            MetricDate: d,
                            Device: device,
                            Clicks: (int)row.Clicks,
                            Impressions: (int)row.Impressions,
                            Ctr: Math.Round((decimal)row.Ctr, 4),
                            AveragePosition: Math.Round((decimal)row.Position, 2)
                        ));
                    }
                }
            }

            // 2. Fetch Query & Page breakdown
            var queryMetrics = new List<GscQueryMetricRecord>();
            var queryReqBody = new
            {
                startDate = startDate.ToString("yyyy-MM-dd"),
                endDate = endDate.ToString("yyyy-MM-dd"),
                dimensions = new[] { "date", "query", "page", "country", "device" },
                rowLimit = 5000
            };

            using var queryReq = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(queryReqBody)
            };
            queryReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var queryRes = await _httpClient.SendAsync(queryReq, cancellationToken);
            if (queryRes.IsSuccessStatusCode)
            {
                var queryData = await queryRes.Content.ReadFromJsonAsync<GscQueryResponse>(cancellationToken: cancellationToken);
                if (queryData?.Rows != null)
                {
                    foreach (var row in queryData.Rows)
                    {
                        if (row.Keys != null && row.Keys.Count >= 5 && DateOnly.TryParse(row.Keys[0], out var d))
                        {
                            queryMetrics.Add(new GscQueryMetricRecord(
                                MetricDate: d,
                                QueryText: row.Keys[1],
                                PageUrl: row.Keys[2],
                                CountryCode: row.Keys[3].ToUpperInvariant(),
                                Device: row.Keys[4].ToUpperInvariant(),
                                Clicks: (int)row.Clicks,
                                Impressions: (int)row.Impressions,
                                Ctr: Math.Round((decimal)row.Ctr, 4),
                                Position: Math.Round((decimal)row.Position, 2)
                            ));
                        }
                    }
                }
            }

            return new GscFetchDataResult(true, null, dailyMetrics, queryMetrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching GSC performance data for {Property}", propertyIdentifier);
            return new GscFetchDataResult(false, ex.Message, Array.Empty<GscDailyMetricRecord>(), Array.Empty<GscQueryMetricRecord>());
        }
    }

    private class GscSitesResponse
    {
        [JsonPropertyName("siteEntry")]
        public List<GscSiteEntry>? SiteEntry { get; set; }
    }

    private class GscSiteEntry
    {
        [JsonPropertyName("siteUrl")]
        public string? SiteUrl { get; set; }

        [JsonPropertyName("permissionLevel")]
        public string? PermissionLevel { get; set; }
    }

    private class GscQueryResponse
    {
        [JsonPropertyName("rows")]
        public List<GscQueryRow>? Rows { get; set; }
    }

    private class GscQueryRow
    {
        [JsonPropertyName("keys")]
        public List<string>? Keys { get; set; }

        [JsonPropertyName("clicks")]
        public double Clicks { get; set; }

        [JsonPropertyName("impressions")]
        public double Impressions { get; set; }

        [JsonPropertyName("ctr")]
        public double Ctr { get; set; }

        [JsonPropertyName("position")]
        public double Position { get; set; }
    }
}
