using System.Net;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class Ga4SyncJobRunner : IGa4SyncRunner
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IGoogleAuthService _authService;
    private readonly IGoogleAnalyticsClient _ga4Client;
    private readonly ILogger<Ga4SyncJobRunner> _logger;

    public Ga4SyncJobRunner(
        IApplicationDbContext context,
        ITokenEncryptionService encryptionService,
        IGoogleAuthService authService,
        IGoogleAnalyticsClient ga4Client,
        ILogger<Ga4SyncJobRunner> logger)
    {
        _context = context;
        _encryptionService = encryptionService;
        _authService = authService;
        _ga4Client = ga4Client;
        _logger = logger;
    }

    public async Task<Ga4SyncExecutionResult> ExecuteSyncAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting GA4 synchronization for Project {ProjectId}", projectId);

        var connection = await _context.GoogleConnections
            .FirstOrDefaultAsync(c => c.ProjectId == projectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            _logger.LogWarning("No GA4 connection found for Project {ProjectId}", projectId);
            return new Ga4SyncExecutionResult(false, "No active Google Analytics 4 connection found.", 0, 0, 0);
        }

        if (string.IsNullOrEmpty(connection.PropertyIdentifier))
        {
            _logger.LogWarning("No GA4 property bound for Project {ProjectId}", projectId);
            return new Ga4SyncExecutionResult(false, "No GA4 property has been bound to this project.", 0, 0, 0);
        }

        try
        {
            var refreshToken = _encryptionService.Decrypt(connection.EncryptedRefreshToken);
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new InvalidOperationException("Failed to decrypt GA4 refresh token.");
            }

            var tokenResult = await _authService.RefreshAccessTokenAsync(refreshToken, cancellationToken);
            var accessToken = tokenResult.AccessToken;

            // Rolling 3-day window: (today - 3) to (today - 1)
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = today.AddDays(-1);
            var startDate = endDate.AddDays(-2);

            _logger.LogInformation("Fetching GA4 organic traffic data for {Property} between {Start} and {End}",
                connection.PropertyIdentifier, startDate, endDate);

            var fetchData = await _ga4Client.FetchPerformanceDataAsync(
                accessToken,
                connection.PropertyIdentifier,
                startDate,
                endDate,
                cancellationToken);

            if (!fetchData.Success)
            {
                connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
                connection.LastErrorMessage = fetchData.ErrorMessage ?? "Failed to fetch organic traffic data from Google Analytics 4.";
                connection.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);

                return new Ga4SyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
            }

            // 1. Idempotent Upsert for Ga4DailyMetrics (Property-level)
            var existingDaily = await _context.Ga4DailyMetrics
                .Where(d => d.ProjectId == projectId 
                         && d.PropertyIdentifier == connection.PropertyIdentifier 
                         && d.MetricDate >= startDate 
                         && d.MetricDate <= endDate)
                .ToListAsync(cancellationToken);

            var dailyMap = existingDaily.ToDictionary(d => d.MetricDate);

            foreach (var record in fetchData.DailyMetrics)
            {
                if (dailyMap.TryGetValue(record.MetricDate, out var existing))
                {
                    existing.Sessions = record.Sessions;
                    existing.ActiveUsers = record.ActiveUsers;
                    existing.EngagementRate = record.EngagementRate;
                    existing.Conversions = record.Conversions;
                    existing.Revenue = record.Revenue;
                    existing.SyncedAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    var newDaily = new Ga4DailyMetric
                    {
                        ProjectId = projectId,
                        PropertyIdentifier = connection.PropertyIdentifier,
                        MetricDate = record.MetricDate,
                        Sessions = record.Sessions,
                        ActiveUsers = record.ActiveUsers,
                        EngagementRate = record.EngagementRate,
                        Conversions = record.Conversions,
                        Revenue = record.Revenue,
                        SyncedAt = DateTimeOffset.UtcNow
                    };
                    _context.Ga4DailyMetrics.Add(newDaily);
                    dailyMap[record.MetricDate] = newDaily;
                }
            }

            // 2. Idempotent Upsert for Ga4LandingPageMetrics (Attributed landing pages with 2,500 daily cap)
            var existingPages = await _context.Ga4LandingPageMetrics
                .Where(p => p.ProjectId == projectId 
                         && p.PropertyIdentifier == connection.PropertyIdentifier 
                         && p.MetricDate >= startDate 
                         && p.MetricDate <= endDate)
                .ToListAsync(cancellationToken);

            _context.Ga4LandingPageMetrics.RemoveRange(existingPages);

            var pageRecordsToAdd = new List<Ga4LandingPageMetric>();
            var groupedByDate = fetchData.LandingPageMetrics.GroupBy(p => p.MetricDate);

            foreach (var dateGroup in groupedByDate)
            {
                var sortedPages = dateGroup
                    .OrderByDescending(p => p.Sessions)
                    .ThenByDescending(p => p.Conversions)
                    .ToList();

                var topPages = sortedPages.Take(2500).ToList();
                var remainingPages = sortedPages.Skip(2500).ToList();

                foreach (var p in topPages)
                {
                    pageRecordsToAdd.Add(new Ga4LandingPageMetric
                    {
                        ProjectId = projectId,
                        PropertyIdentifier = connection.PropertyIdentifier,
                        MetricDate = p.MetricDate,
                        LandingPage = p.LandingPage,
                        Sessions = p.Sessions,
                        ActiveUsers = p.ActiveUsers,
                        EngagementRate = p.EngagementRate,
                        Conversions = p.Conversions,
                        Revenue = p.Revenue,
                        SyncedAt = DateTimeOffset.UtcNow
                    });
                }

                if (remainingPages.Count > 0)
                {
                    var otherSessions = remainingPages.Sum(r => r.Sessions);
                    var otherUsers = remainingPages.Sum(r => r.ActiveUsers);
                    var otherConversions = remainingPages.Sum(r => r.Conversions);
                    var otherRevenue = remainingPages.Sum(r => r.Revenue);
                    var sessionWeightedEngagement = remainingPages.Sum(r => r.EngagementRate * (decimal)r.Sessions);
                    var avgEngagement = otherSessions > 0 ? Math.Round(sessionWeightedEngagement / otherSessions, 4) : 0m;

                    pageRecordsToAdd.Add(new Ga4LandingPageMetric
                    {
                        ProjectId = projectId,
                        PropertyIdentifier = connection.PropertyIdentifier,
                        MetricDate = dateGroup.Key,
                        LandingPage = "(other long-tail landing pages)",
                        Sessions = otherSessions,
                        ActiveUsers = otherUsers,
                        EngagementRate = avgEngagement,
                        Conversions = otherConversions,
                        Revenue = otherRevenue,
                        SyncedAt = DateTimeOffset.UtcNow
                    });
                }
            }

            _context.Ga4LandingPageMetrics.AddRange(pageRecordsToAdd);

            // Update Connection status
            connection.SyncStatus = GoogleConstants.SyncStatuses.Active;
            connection.LastSyncedAt = DateTimeOffset.UtcNow;
            connection.LastErrorMessage = null;
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("GA4 sync completed successfully for Project {ProjectId}. Processed {DailyCount} daily rows, {PageCount} page rows.",
                projectId, fetchData.DailyMetrics.Count, pageRecordsToAdd.Count);

            var daysProcessed = fetchData.DailyMetrics.Select(d => d.MetricDate).Distinct().Count();

            return new Ga4SyncExecutionResult(
                Success: true,
                ErrorMessage: null,
                DaysProcessed: daysProcessed,
                TotalDailyRecords: fetchData.DailyMetrics.Count,
                TotalLandingPageRecords: pageRecordsToAdd.Count
            );
        }
        catch (GoogleOAuthException oAuthEx)
        {
            _logger.LogError(oAuthEx, "Google OAuth failure during GA4 sync for Project {ProjectId}: StatusCode={StatusCode}, ErrorCode={ErrorCode}",
                projectId, oAuthEx.StatusCode, oAuthEx.ErrorCode);

            bool isAuthFailure = oAuthEx.IsAuthenticationFailure;
            connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
            connection.LastErrorMessage = isAuthFailure
                ? "Google authorization expired or revoked. Please reconnect Google Analytics 4."
                : "Failed to synchronize with Google Analytics 4. Check credentials.";
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            try
            {
                await _context.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Failed to save GA4 sync error state to database.");
            }

            return new Ga4SyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute GA4 sync for Project {ProjectId}", projectId);

            connection.SyncStatus = GoogleConstants.SyncStatuses.Error;
            connection.LastErrorMessage = "Failed to synchronize with Google Analytics 4. Check credentials.";
            connection.UpdatedAt = DateTimeOffset.UtcNow;

            try
            {
                await _context.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Failed to save GA4 sync error state to database.");
            }

            return new Ga4SyncExecutionResult(false, connection.LastErrorMessage, 0, 0, 0);
        }
    }

    public async Task<int> ExecuteAllActiveSyncsAsync(CancellationToken cancellationToken = default)
    {
        var activeConnections = await _context.GoogleConnections
            .Where(c => c.ServiceType == GoogleConstants.ServiceTypes.Ga4 
                     && c.SyncStatus == GoogleConstants.SyncStatuses.Active 
                     && !string.IsNullOrEmpty(c.PropertyIdentifier))
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
