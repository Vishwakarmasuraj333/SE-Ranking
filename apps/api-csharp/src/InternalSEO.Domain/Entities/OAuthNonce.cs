namespace InternalSEO.Domain.Entities;

public class OAuthNonce
{
    public long Id { get; set; }
    public string NonceHash { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual Project Project { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
