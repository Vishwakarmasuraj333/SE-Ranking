namespace InternalSEO.Application.Common.Interfaces;

public interface IActivityLogger
{
    Task LogAsync(
        string actionType,
        string entityType,
        string entityId,
        Guid? projectId = null,
        object? payload = null,
        CancellationToken cancellationToken = default);

    Task LogAsync(
        string actionType,
        string entityType,
        string entityId,
        Guid? projectId = null,
        object? payload = null,
        Guid? actorId = null,
        string? actorEmail = null,
        string? actorRole = null,
        CancellationToken cancellationToken = default);
}
