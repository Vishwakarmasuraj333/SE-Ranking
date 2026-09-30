using InternalSEO.Domain.Enums;

namespace InternalSEO.Application.Features.Projects.DTOs;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PrimaryDomain { get; set; } = string.Empty;
    public string Protocol { get; set; } = "https://";
    public string? Industry { get; set; }
    public string CountryCode { get; set; } = "US";
    public string? PrimaryLocation { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Timezone { get; set; } = "UTC";
    public string DefaultSearchEngine { get; set; } = "google";
    public string DefaultDevice { get; set; } = "desktop";
    public ProjectStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public int MemberCount { get; set; }
    public string? UserAccessLevel { get; set; }
}

public class ProjectDetailDto : ProjectDto
{
    public Guid CreatedBy { get; set; }
    public string CreatorEmail { get; set; } = string.Empty;
    public IReadOnlyList<ProjectMemberDto> Members { get; set; } = Array.Empty<ProjectMemberDto>();
}

public class ProjectMemberDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public ProjectAccessLevel AccessLevel { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
}
