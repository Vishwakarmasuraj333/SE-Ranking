using InternalSEO.Domain.Common;

namespace InternalSEO.Domain.Entities;

public class Competitor : BaseAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string? Notes { get; set; }

    // Navigation
    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<CompetitorRankResult> RankResults { get; set; } = new List<CompetitorRankResult>();
}