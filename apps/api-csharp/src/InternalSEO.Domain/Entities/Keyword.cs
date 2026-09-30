namespace InternalSEO.Domain.Entities;

public class Keyword
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Guid? GroupId { get; set; }

    public string KeywordText { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;
    public string SearchEngine { get; set; } = "google";
    public string CountryCode { get; set; } = "US";
    public string? LocationName { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Device { get; set; } = "desktop";
    public string? TargetUrl { get; set; }
    public string? SearchIntent { get; set; }

    public int? MonthlySearchVolume { get; set; }
    public decimal? KeywordDifficulty { get; set; }
    public decimal? CpcUsd { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastCheckedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid CreatedBy { get; set; }

    // Navigation
    public virtual Project Project { get; set; } = null!;
    public virtual KeywordGroup? Group { get; set; }
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<KeywordTag> KeywordTags { get; set; } = new List<KeywordTag>();
    public virtual ICollection<RankResult> RankResults { get; set; } = new List<RankResult>();
    public virtual ICollection<CompetitorRankResult> CompetitorRankResults { get; set; } = new List<CompetitorRankResult>();
}
