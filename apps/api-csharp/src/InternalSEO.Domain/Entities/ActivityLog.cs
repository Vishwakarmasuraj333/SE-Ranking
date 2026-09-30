namespace InternalSEO.Domain.Entities;

public class ActivityLog
{
    public long Id { get; set; }
    public Guid? ActorId { get; set; }
    public string ActorEmail { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public string? PayloadJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public virtual User? Actor { get; set; }
    public virtual Project? Project { get; set; }
}
