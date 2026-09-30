using System.Text.Json;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;

namespace InternalSEO.Infrastructure.Services;

public class ActivityLogger : IActivityLogger
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ActivityLogger(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public Task LogAsync(
        string actionType,
        string entityType,
        string entityId,
        Guid? projectId = null,
        object? payload = null,
        CancellationToken cancellationToken = default)
    {
        return LogAsync(
            actionType,
            entityType,
            entityId,
            projectId,
            payload,
            actorId: null,
            actorEmail: null,
            actorRole: null,
            cancellationToken: cancellationToken);
    }

    public async Task LogAsync(
        string actionType,
        string entityType,
        string entityId,
        Guid? projectId = null,
        object? payload = null,
        Guid? actorId = null,
        string? actorEmail = null,
        string? actorRole = null,
        CancellationToken cancellationToken = default)
    {
        var effectiveActorId = actorId ?? _currentUser.UserId;
        var effectiveEmail = actorEmail ?? _currentUser.Email ?? "system@internal";
        var effectiveRole = actorRole ?? _currentUser.Role ?? "System";

        var log = new ActivityLog
        {
            ActorId = effectiveActorId,
            ActorEmail = effectiveEmail,
            ActorRole = effectiveRole,
            ActionType = actionType,
            EntityType = entityType,
            EntityId = entityId,
            ProjectId = projectId,
            PayloadJson = payload != null ? JsonSerializer.Serialize(payload) : null,
            IpAddress = _currentUser.IpAddress,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.ActivityLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
