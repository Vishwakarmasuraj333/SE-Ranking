using System.Net;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class GscSyncJobRunner : IGscSyncRunner
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IGoogleAuthService _authService;
    private readonly IGoogleSearchConsoleClient _gscClient;
    private readonly INotificationService _notificationService;
    private readonly ILogger<GscSyncJobRunner> _logger;

    public GscSyncJobRunner(
        IApplicationDbContext context,
        ITokenEncryptionService encryptionService,
        IGoogleAuthService authService,
        IGoogleSearchConsoleClient gscClient,
        INotificationService notificationService,
        ILogger<GscSyncJobRunner> logger)
    {
        _context = context;
        _encryptionService = encryptionService;
        _authService = authService;
        _gscClient = gscClient;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<GscSyncExecutionResult> ExecuteSyncAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting GSC synchronization for Project {ProjectId}", projectId);

        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == projectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            _logger.LogWarning("No GSC connection found for Project {ProjectId}", projectId);
            return new GscSyncExecutionResult(false, "No active Google Search Console connection found.", 0, 0, 0);
        }

        if (string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            _logger.LogWarning("No GSC property bound for Project {ProjectId}", projectId);
            return new GscSyncExecutionResult(false, "No GSC property has been bound to this project.", 0, 0, 0);
        }

        try
        {
            // Decrypt refresh token
            var refreshToken = _encryptionService.Decrypt(connection.EncryptedRefreshToken);
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new InvalidOperationException("Failed to decrypt GSC refresh token.");
            }

            // Refresh access token
            var tokenResult = await _authService.RefreshAccessTokenAsync(refreshToken, cancellationToken);
            var accessToken = tokenResult.AccessToken;

            // Compute rolling 3-day synchronization window (Google 48h data lag)
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = today.AddDays(-1);
            var startDate = endDate.AddDays(-2);

            _logger.LogInformation("Fetching GSC performance data for {Property} between {Start} and {End}", 
                connection.PropertyIdentifier, startDate, endDate);

            var fetchData = await _gscClient.FetchPerformanceDataAsync(
                accessToken,
                connection.PropertyIdentifier,
                startDate,
                endDate,
                cancellationToken);

            if (!fetchData.Success)
            {
                connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
                connection.LastErrorMessage = fetchData.ErrorMessage ?? "Failed to fetch performance data from Google Search Console.";
                connection.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);

                // Typed check for HTTP 401/403 authentication/authorization failure from GSC API
                bool isAuthError = fetchData.IsAuthenticationFailure ||
                                   fetchData.StatusCode == HttpStatusCode.Unauthorized ||
                                   fetchData.StatusCode == HttpStatusCode.Forbidden;

                if (isAuthError)
                {
                    try
                    {
                        var targetUrl = $"/projects/{projectId}/settings/integrations/gsc";
                        await _notificationService.CreateProjectBroadcastAsync(
                            projectId: projectId,
                            title: "Google Search Console Authentication Failure",
                            message: "Search Console sync failed due to authentication or permission errors. Please re-authenticate your Google connection.",
                            severity: "Critical",
                            eventType: "SyncFailed",
                            targetUrl: targetUrl,
                            cancellationToken: CancellationToken.None);
                    }
                    catch (Exception notifEx)
                    {
                        _logger.LogError(notifEx, "Failed to broadcast SyncFailed notification for Project {ProjectId}", projectId);
                    }
                }

                return new GscSyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
            }

            // 1. Idempotent Upsert for Daily Metrics
            var existingDaily = await _context.GscDailyMetrics
                .Where(d => d.ProjectId == projectId && d.MetricDate >= startDate && d.MetricDate <= endDate)
                .ToListAsync(cancellationToken);

            var dailyMap = existingDaily.ToDictionary(d => (d.MetricDate, d.Device.ToUpperInvariant()));

            foreach (var record in fetchData.DailyMetrics)
            {
                var key = (record.MetricDate, record.Device.ToUpperInvariant());
                if (dailyMap.TryGetValue(key, out var existing))
                {
                    existing.Clicks = record.Clicks;
                    existing.Impressions = record.Impressions;
                    existing.Ctr = record.Ctr;
                    existing.AveragePosition = record.AveragePosition;
                    existing.SyncedAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    var newDaily = new GscDailyMetric
                    {
                        ProjectId = projectId,
                        MetricDate = record.MetricDate,
                        Device = record.Device.ToUpperInvariant(),
                        Clicks = record.Clicks,
                        Impressions = record.Impressions,
                        Ctr = record.Ctr,
                        AveragePosition = record.AveragePosition,
                        SyncedAt = DateTimeOffset.UtcNow
                    };
                    _context.GscDailyMetrics.Add(newDaily);
                    dailyMap[key] = newDaily;
                }
            }

            // Ensure ALL device summary exists for each date
            var datesWithRecords = fetchData.DailyMetrics.Select(d => d.MetricDate).Distinct().ToList();
            foreach (var d in datesWithRecords)
            {
                var allKey = (d, "ALL");
                if (!dailyMap.ContainsKey(allKey))
                {
                    var nonAll = dailyMap.Values.Where(v => v.MetricDate == d && v.Device != "ALL").ToList();
                    if (nonAll.Count > 0)
                    {
                        var totalClicks = nonAll.Sum(x => x.Clicks);
                        var totalImp = nonAll.Sum(x => x.Impressions);
                        var ctr = totalImp > 0 ? Math.Round((decimal)totalClicks / totalImp, 4) : 0;
                        var avgPos = Math.Round(nonAll.Average(x => x.AveragePosition), 2);

                        var allDaily = new GscDailyMetric
                        {
                            ProjectId = projectId,
                            MetricDate = d,
                            Device = "ALL",
                            Clicks = totalClicks,
                            Impressions = totalImp,
                            Ctr = ctr,
                            AveragePosition = avgPos,
                            SyncedAt = DateTimeOffset.UtcNow
                        };
                        _context.GscDailyMetrics.Add(allDaily);
                        dailyMap[allKey] = allDaily;
                    }
                }
            }

            // 2. Idempotent Upsert for Query Metrics with Cardinality Cap (Top 5,000 + Long-tail aggregation)
            var existingQueries = await _context.GscQueryMetrics
                .Where(q => q.ProjectId == projectId && q.MetricDate >= startDate && q.MetricDate <= endDate)
                .ToListAsync(cancellationToken);

            _context.GscQueryMetrics.RemoveRange(existingQueries);

            var queryRecordsToAdd = new List<GscQueryMetric>();
            var groupedByDate = fetchData.QueryMetrics.GroupBy(q => q.MetricDate);

            foreach (var dateGroup in groupedByDate)
            {
                var sortedQueries = dateGroup
                    .OrderByDescending(q => q.Clicks)
                    .ThenByDescending(q => q.Impressions)
                    .ToList();

                var topQueries = sortedQueries.Take(5000).ToList();
                var remainingQueries = sortedQueries.Skip(5000).ToList();

                foreach (var q in topQueries)
                {
                    queryRecordsToAdd.Add(new GscQueryMetric
                    {
                        ProjectId = projectId,
                        MetricDate = q.MetricDate,
                        QueryText = q.QueryText,
                        PageUrl = q.PageUrl,
                        CountryCode = string.IsNullOrWhiteSpace(q.CountryCode) ? "ALL" : q.CountryCode.ToUpperInvariant(),
                        Device = string.IsNullOrWhiteSpace(q.Device) ? "ALL" : q.Device.ToUpperInvariant(),
                        Clicks = q.Clicks,
                        Impressions = q.Impressions,
                        Ctr = q.Ctr,
                        Position = q.Position,
                        SyncedAt = DateTimeOffset.UtcNow
                    });
                }

                if (remainingQueries.Count > 0)
                {
                    var longTailClicks = remainingQueries.Sum(r => r.Clicks);
                    var longTailImpressions = remainingQueries.Sum(r => r.Impressions);
                    var longTailCtr = longTailImpressions > 0 ? Math.Round((decimal)longTailClicks / longTailImpressions, 4) : 0;
                    var longTailPos = Math.Round(remainingQueries.Average(r => r.Position), 2);

                    queryRecordsToAdd.Add(new GscQueryMetric
                    {
                        ProjectId = projectId,
                        MetricDate = dateGroup.Key,
                        QueryText = "(other long-tail queries)",
                        PageUrl = "*",
                        CountryCode = "ALL",
                        Device = "ALL",
                        Clicks = longTailClicks,
                        Impressions = longTailImpressions,
                        Ctr = longTailCtr,
                        Position = longTailPos,
                        SyncedAt = DateTimeOffset.UtcNow
                    });
                }
            }

            _context.GscQueryMetrics.AddRange(queryRecordsToAdd);

            // Update Connection status
            connection.SyncStatus = GoogleConstants.SyncStatuses.Active;
            connection.LastSyncedAt = DateTimeOffset.UtcNow;
            connection.LastErrorMessage = null;
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("GSC sync completed successfully for Project {ProjectId}. Processed {DailyCount} daily rows, {QueryCount} query rows.",
                projectId, fetchData.DailyMetrics.Count, queryRecordsToAdd.Count);

            return new GscSyncExecutionResult(
                Success: true,
                ErrorMessage: null,
                DaysProcessed: datesWithRecords.Count,
                TotalDailyRecords: fetchData.DailyMetrics.Count,
                TotalQueryRecords: queryRecordsToAdd.Count
            );
        }
        catch (GoogleOAuthException oAuthEx)
        {
            _logger.LogError(oAuthEx, "Google OAuth failure during GSC sync for Project {ProjectId}: StatusCode={StatusCode}, ErrorCode={ErrorCode}",
                projectId, oAuthEx.StatusCode, oAuthEx.ErrorCode);

            bool isAuthFailure = oAuthEx.IsAuthenticationFailure;
            connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
            connection.LastErrorMessage = isAuthFailure
                ? "Google authorization expired or revoked. Please reconnect Search Console."
                : "Failed to synchronize with Google Search Console. Check credentials.";
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            try
            {
                await _context.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Failed to save GSC sync error state to database.");
            }

            if (isAuthFailure)
            {
                try
                {
                    var targetUrl = $"/projects/{projectId}/settings/integrations/gsc";
                    await _notificationService.CreateProjectBroadcastAsync(
                        projectId: projectId,
                        title: "Google Search Console Authentication Failure",
                        message: "Google authorization expired or revoked. Please reconnect Search Console.",
                        severity: "Critical",
                        eventType: "SyncFailed",
                        targetUrl: targetUrl,
                        cancellationToken: CancellationToken.None);
                }
                catch (Exception notifEx)
                {
                    _logger.LogError(notifEx, "Failed to broadcast SyncFailed notification for Project {ProjectId}", projectId);
                }
            }

            return new GscSyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute GSC sync for Project {ProjectId}", projectId);

            // Generic/transient exceptions (network, timeout, 5xx): NEVER trigger SyncFailed
            connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
            connection.LastErrorMessage = "Failed to synchronize with Google Search Console. Check credentials.";
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            try
            {
                await _context.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Failed to save GSC sync error state to database.");
            }

            return new GscSyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
        }
    }

    public async Task<int> ExecuteAllActiveSyncsAsync(CancellationToken cancellationToken = default)
    {
        var activeConnections = await _context.GoogleConnections
            .Where(c => c.ServiceType == GoogleConstants.ServiceTypes.Gsc && c.SyncStatus == GoogleConstants.SyncStatuses.Active && !string.IsNullOrEmpty(c.PropertyIdentifier))
            .Select(c => c.ProjectId)
            .ToListAsync(cancellationToken);

        int successful = 0;
        foreach (var projectId in activeConnections)
        {
            var res = await ExecuteSyncAsync(projectId, cancellationToken);
            if (res.Success)
            {
                successful++;
            }
        }

        return successful;
    }
}
