using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IApplicationDbContext context,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> CreateDirectNotificationAsync(
        Guid projectId,
        Guid userId,
        string title,
        string message,
        string severity,
        string eventType,
        string? targetUrl,
        CancellationToken cancellationToken = default)
    {
        var windowStart = DateTimeOffset.UtcNow.AddHours(-24);

        // 24-Hour Deduplication check for logical event & target entity
        var isDuplicate = await _context.Notifications
            .AnyAsync(n =>
                n.ProjectId == projectId &&
                n.UserId == userId &&
                n.EventType == eventType &&
                n.TargetUrl == targetUrl &&
                n.CreatedAt >= windowStart,
                cancellationToken);

        if (isDuplicate)
        {
            _logger.LogInformation(
                "Suppressed duplicate notification for User {UserId}, Project {ProjectId}, Event {EventType}, TargetUrl {TargetUrl} within 24h.",
                userId, projectId, eventType, targetUrl);
            return false;
        }

        var notification = new Notification
        {
            ProjectId = projectId,
            UserId = userId,
            Title = title,
            Message = message,
            Severity = severity,
            EventType = eventType,
            TargetUrl = targetUrl,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created direct notification {Id} for User {UserId}, Project {ProjectId}, Event {EventType}.",
            notification.Id, userId, projectId, eventType);

        return true;
    }

    public async Task<int> CreateProjectBroadcastAsync(
        Guid projectId,
        string title,
        string message,
        string severity,
        string eventType,
        string? targetUrl,
        CancellationToken cancellationToken = default)
    {
        var windowStart = DateTimeOffset.UtcNow.AddHours(-24);

        // Authoritative broadcast semantics: materialized per-user to authorized project members
        var memberUserIds = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .Select(pm => pm.UserId)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (memberUserIds.Count == 0)
        {
            _logger.LogWarning("Cannot broadcast notification: Project {ProjectId} has no assigned members.", projectId);
            return 0;
        }

        // Find users who already received this exact notification within 24 hours
        var alreadyNotifiedUserIds = await _context.Notifications
            .Where(n =>
                n.ProjectId == projectId &&
                n.EventType == eventType &&
                n.TargetUrl == targetUrl &&
                n.CreatedAt >= windowStart &&
                n.UserId != null &&
                memberUserIds.Contains(n.UserId.Value))
            .Select(n => n.UserId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

        var usersToNotify = memberUserIds.Except(alreadyNotifiedUserIds).ToList();
        if (usersToNotify.Count == 0)
        {
            _logger.LogInformation(
                "Suppressed project broadcast for Project {ProjectId}, Event {EventType}, TargetUrl {TargetUrl}: all {Count} members already notified in last 24h.",
                projectId, eventType, targetUrl, memberUserIds.Count);
            return 0;
        }

        var now = DateTimeOffset.UtcNow;
        var notifications = usersToNotify.Select(userId => new Notification
        {
            ProjectId = projectId,
            UserId = userId,
            Title = title,
            Message = message,
            Severity = severity,
            EventType = eventType,
            TargetUrl = targetUrl,
            IsRead = false,
            CreatedAt = now
        }).ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Broadcast notification for Project {ProjectId}, Event {EventType} created for {CreatedCount} members ({SuppressedCount} suppressed by 24h dedup).",
            projectId, eventType, notifications.Count, alreadyNotifiedUserIds.Count);

        return notifications.Count;
    }
}
