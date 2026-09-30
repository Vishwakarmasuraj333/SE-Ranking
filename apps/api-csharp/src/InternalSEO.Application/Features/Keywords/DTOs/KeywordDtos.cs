namespace InternalSEO.Application.Features.Keywords.DTOs;

public record KeywordDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public Guid? GroupId { get; init; }
    public string? GroupName { get; init; }
    public string? GroupColor { get; init; }
    public string KeywordText { get; init; } = string.Empty;
    public string SearchEngine { get; init; } = "google";
    public string CountryCode { get; init; } = "US";
    public string? LocationName { get; init; }
    public string LanguageCode { get; init; } = "en";
    public string Device { get; init; } = "desktop";
    public string? TargetUrl { get; init; }
    public string? SearchIntent { get; init; }
    public int? MonthlySearchVolume { get; init; }
    public decimal? KeywordDifficulty { get; init; }
    public decimal? CpcUsd { get; init; }
    public bool IsActive { get; init; } = true;
    public DateTimeOffset? LastCheckedAt { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public List<string> Tags { get; init; } = new();
}

public record KeywordGroupDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? ColorHex { get; init; }
    public int KeywordCount { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record TagDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int KeywordCount { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record ImportKeywordsResultDto
{
    public int TotalProcessed { get; init; }
    public int ImportedCount { get; init; }
    public int SkippedDuplicatesCount { get; init; }
    public int FailedCount { get; init; }
    public List<string> Errors { get; init; } = new();
}

public class ImportKeywordRow
{
    public string Keyword { get; set; } = string.Empty;
    public string? SearchEngine { get; set; }
    public string? Country { get; set; }
    public string? Device { get; set; }
    public string? Location { get; set; }
    public string? Language { get; set; }
    public string? Intent { get; set; }
    public string? TargetUrl { get; set; }
    public string? Group { get; set; }
    public string? Tags { get; set; }
    public int? Volume { get; set; }
    public decimal? Difficulty { get; set; }
    public decimal? Cpc { get; set; }
}
