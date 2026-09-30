using InternalSEO.Domain.Enums;

namespace InternalSEO.Domain.Entities;

public class ProjectMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public ProjectAccessLevel AccessLevel { get; set; } = ProjectAccessLevel.Member;
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid AssignedBy { get; set; }

    public virtual Project Project { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
