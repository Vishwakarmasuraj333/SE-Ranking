using InternalSEO.Domain.Constants;

namespace InternalSEO.Domain.Entities;

public class GoogleConnection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string ServiceType { get; set; } = GoogleConstants.ServiceTypes.Gsc;
    public string PropertyIdentifier { get; set; } = string.Empty;
    public string AccountEmail { get; set; } = string.Empty;
    public string EncryptedRefreshToken { get; set; } = string.Empty;
    public DateTimeOffset? TokenExpiresAt { get; set; }
    public string SyncStatus { get; set; } = GoogleConstants.SyncStatuses.Active;
    public DateTimeOffset? LastSyncedAt { get; set; }
    public string? LastErrorMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Project Project { get; set; } = null!;
}
