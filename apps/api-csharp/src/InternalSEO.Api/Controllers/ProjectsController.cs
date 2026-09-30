using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Projects.Commands.CreateProject;
using InternalSEO.Application.Features.Projects.Commands.Members;
using InternalSEO.Application.Features.Projects.Commands.UpdateProject;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Application.Features.Projects.Queries.GetProjectById;
using InternalSEO.Application.Features.Projects.Queries.GetProjects;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize]
public class ProjectsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<ProjectDto>>>> GetProjects(
        [FromQuery] string? search,
        [FromQuery] ProjectStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var result = await Mediator.Send(new GetProjectsQuery(search, status, page, pageSize));
        return Success(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<ProjectDetailDto>>> GetProjectById(Guid id)
    {
        var result = await Mediator.Send(new GetProjectByIdQuery(id));
        return Success(result);
    }

    [HttpPost]
    [Authorize(Roles = SystemRoles.SuperAdmin)]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> CreateProject([FromBody] CreateProjectCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedSuccess($"/api/v1/projects/{result.Id}", result, "Project created successfully.");
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var command = new UpdateProjectCommand
        {
            Id = id,
            Name = request.Name,
            Industry = request.Industry,
            PrimaryLocation = request.PrimaryLocation,
            Timezone = request.Timezone,
            DefaultSearchEngine = request.DefaultSearchEngine,
            DefaultDevice = request.DefaultDevice,
            Status = request.Status
        };

        var result = await Mediator.Send(command);
        return Success(result, "Project updated successfully.");
    }

    [HttpGet("{id:guid}/members")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProjectMemberDto>>>> GetProjectMembers(Guid id)
    {
        var project = await Mediator.Send(new GetProjectByIdQuery(id));
        return Success(project.Members);
    }

    [HttpPost("{id:guid}/members")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ProjectMemberDto>>> AddMember(Guid id, [FromBody] AddMemberRequest request)
    {
        var command = new AddProjectMemberCommand(id, request.UserId, request.AccessLevel);
        var result = await Mediator.Send(command);
        return Success(result, "Member assigned successfully.");
    }

    [HttpDelete("{id:guid}/members/{userId:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveMember(Guid id, Guid userId)
    {
        var command = new RemoveProjectMemberCommand(id, userId);
        var result = await Mediator.Send(command);
        return Success(result, "Member removed successfully.");
    }
}

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? PrimaryLocation { get; set; }
    public string Timezone { get; set; } = "UTC";
    public string DefaultSearchEngine { get; set; } = "google";
    public string DefaultDevice { get; set; } = "desktop";
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
}

public class AddMemberRequest
{
    public Guid UserId { get; set; }
    public ProjectAccessLevel AccessLevel { get; set; } = ProjectAccessLevel.Member;
}
