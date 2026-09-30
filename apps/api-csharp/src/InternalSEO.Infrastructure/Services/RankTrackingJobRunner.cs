using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class RankTrackingJobRunner : IRankTrackingJobRunner
{
    private readonly IApplicationDbContext _context;
    private readonly IRankTrackingProvider _rankTrackingProvider;
    private readonly INotificationService _notificationService;
    private readonly IActivityLogger _activityLogger;
    private readonly ILogger<RankTrackingJobRunner> _logger;

    public RankTrackingJobRunner(
        IApplicationDbContext context,
        IRankTrackingProvider rankTrackingProvider,
        INotificationService notificationService,
        IActivityLogger activityLogger,
        ILogger<RankTrackingJobRunner> logger)
    {
        _context = context;
        _rankTrackingProvider = rankTrackingProvider;
        _notificationService = notificationService;
        _activityLogger = activityLogger;
        _logger = logger;
    }

    public async Task<int> ExecuteRankTrackingAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting rank tracking execution for Project {ProjectId}", projectId);

        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            _logger.LogError("Project {ProjectId} not found for rank tracking.", projectId);
            return 0;
        }

        var keywords = await _context.Keywords
            .Where(k => k.ProjectId == projectId && k.IsActive)
            .ToListAsync(cancellationToken);

        if (keywords.Count == 0)
        {
            _logger.LogInformation("No active keywords found for Project {ProjectId}.", projectId);
            return 0;
        }

        var keywordIds = keywords.Select(k => k.Id).ToList();
        var observations = await _rankTrackingProvider.GetObservationsAsync(projectId, keywordIds, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var keywordMap = keywords.ToDictionary(k => k.Id);
        int recordedCount = 0;

        foreach (var obs in observations)
        {
            var existingResult = await _context.RankResults
                .FirstOrDefaultAsync(r => r.KeywordId == obs.KeywordId && r.CheckDate == today, cancellationToken);

            if (existingResult != null)
            {
                existingResult.Position = obs.Position;
                existingResult.PreviousPosition = obs.PreviousPosition;
                existingResult.PositionChange = obs.PositionChange;
                existingResult.RankedUrl = obs.RankedUrl;
                existingResult.IsTargetUrlMatched = obs.IsTargetUrlMatched;
                existingResult.SerpFeatures = obs.SerpFeatures;
                existingResult.ProviderName = obs.ProviderName;
                existingResult.RecordedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                var newResult = new RankResult
                {
                    KeywordId = obs.KeywordId,
                    ProjectId = projectId,
                    CheckDate = today,
                    Position = obs.Position,
                    PreviousPosition = obs.PreviousPosition,
                    PositionChange = obs.PositionChange,
                    RankedUrl = obs.RankedUrl,
                    IsTargetUrlMatched = obs.IsTargetUrlMatched,
                    IsCannibalized = obs.IsCannibalized,
                    SerpFeatures = obs.SerpFeatures,
                    ProviderName = obs.ProviderName,
                    RecordedAt = DateTimeOffset.UtcNow
                };
                _context.RankResults.Add(newResult);
            }

            recordedCount++;

            // Authoritative KeywordDrop Trigger:
            // "Critical keyword drop (> 5 positions for Top 10 keywords)"
            // Condition: previousPosition <= 10 AND positionChange < -5 (e.g. drop from rank 4 to rank 11 = change of -7)
            if (obs.PreviousPosition.HasValue &&
                obs.PreviousPosition.Value <= 10 &&
                obs.PositionChange.HasValue &&
                obs.PositionChange.Value < -5)
            {
                if (keywordMap.TryGetValue(obs.KeywordId, out var kw))
                {
                    var dropAmount = Math.Abs(obs.PositionChange.Value);
                    var currentDisplay = obs.Position.HasValue ? $"#{obs.Position.Value}" : "> 100";
                    var targetUrl = $"/projects/{projectId}/rankings?keywordId={obs.KeywordId}";

                    await _notificationService.CreateProjectBroadcastAsync(
                        projectId: projectId,
                        title: "Critical Keyword Drop Detected",
                        message: $"Keyword '{kw.KeywordText}' dropped {dropAmount} positions (from #{obs.PreviousPosition.Value} to {currentDisplay}).",
                        severity: "Critical",
                        eventType: "KeywordDrop",
                        targetUrl: targetUrl,
                        cancellationToken: cancellationToken);
                }
            }
        }

        // Competitor Rank Tracking
        var competitors = await _context.Competitors
            .Where(c => c.ProjectId == projectId)
            .ToListAsync(cancellationToken);

        if (competitors.Count > 0)
        {
            var compTuples = competitors.Select(c => (c.Id, c.Domain)).ToList();
            var compObservations = await _rankTrackingProvider.GetCompetitorObservationsAsync(
                projectId, keywordIds, compTuples, cancellationToken);

            foreach (var compObs in compObservations)
            {
                var existingCompResult = await _context.CompetitorRankResults
                    .FirstOrDefaultAsync(cr => cr.CompetitorId == compObs.CompetitorId &&
                                               cr.KeywordId == compObs.KeywordId &&
                                               cr.CheckDate == today,
                                         cancellationToken);

                if (existingCompResult != null)
                {
                    // In-place rerun: preserve prior PreviousPosition, recalculate PositionChange
                    existingCompResult.Position = compObs.Position;
                    existingCompResult.RankedUrl = compObs.RankedUrl;
                    existingCompResult.ProviderName = compObs.ProviderName;
                    existingCompResult.RecordedAt = DateTimeOffset.UtcNow;

                    if (compObs.Position.HasValue && existingCompResult.PreviousPosition.HasValue)
                    {
                        existingCompResult.PositionChange = existingCompResult.PreviousPosition.Value - compObs.Position.Value;
                    }
                    else
                    {
                        existingCompResult.PositionChange = null;
                    }
                }
                else
                {
                    // Find most recent prior observation strictly before today
                    var priorResult = await _context.CompetitorRankResults
                        .Where(cr => cr.CompetitorId == compObs.CompetitorId &&
                                     cr.KeywordId == compObs.KeywordId &&
                                     cr.CheckDate < today)
                        .OrderByDescending(cr => cr.CheckDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    int? prevPos = null;
                    int? change = null;

                    if (priorResult != null)
                    {
                        // If previously ranked
                        if (priorResult.Position.HasValue)
                        {
                            prevPos = priorResult.Position.Value;
                            if (compObs.Position.HasValue)
                            {
                                change = prevPos.Value - compObs.Position.Value;
                            }
                            else
                            {
                                // Ranked to unranked: PreviousPosition = prev, Position = null, PositionChange = null
                                change = null;
                            }
                        }
                        else
                        {
                            // Unranked to ranked: PreviousPosition = null, PositionChange = null
                            prevPos = null;
                            change = null;
                        }
                    }

                    var newCompResult = new CompetitorRankResult
                    {
                        CompetitorId = compObs.CompetitorId,
                        KeywordId = compObs.KeywordId,
                        ProjectId = projectId,
                        CheckDate = today,
                        Position = compObs.Position,
                        PreviousPosition = prevPos,
                        PositionChange = change,
                        RankedUrl = compObs.RankedUrl,
                        ProviderName = compObs.ProviderName,
                        RecordedAt = DateTimeOffset.UtcNow
                    };
                    _context.CompetitorRankResults.Add(newCompResult);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Rankings.Checked",
            entityType: "Project",
            entityId: projectId.ToString(),
            projectId: projectId,
            payload: new { KeywordsTracked = recordedCount, Date = today, CompetitorsTracked = competitors.Count },
            cancellationToken: cancellationToken);

        _logger.LogInformation("Rank tracking completed for Project {ProjectId}: {Count} records processed.", projectId, recordedCount);
        return recordedCount;
    }
}
