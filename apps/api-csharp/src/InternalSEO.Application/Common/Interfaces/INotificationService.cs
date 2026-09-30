namespace InternalSEO.Application.Common.Interfaces;

public interface INotificationService
{
    Task<bool> CreateDirectNotificationAsync(
        Guid projectId,
        Guid userId,
        string title,
        string message,
        string severity,
        string eventType,
        string? targetUrl,
        CancellationToken cancellationToken = default);

    Task<int> CreateProjectBroadcastAsync(
        Guid projectId,
        string title,
        string message,
        string severity,
        string eventType,
        string? targetUrl,
        CancellationToken cancellationToken = default);
}
