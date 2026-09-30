using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Keywords.Commands.KeywordGroups;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Application.Features.Keywords.Queries.Metadata;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize]
[Route("api/v1/projects/{projectId:guid}/keyword-groups")]
public class KeywordGroupsController : BaseApiController
{
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<KeywordGroupDto>>>> GetKeywordGroups(Guid projectId)
    {
        var result = await Mediator.Send(new GetKeywordGroupsQuery(projectId));
        return Success(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<KeywordGroupDto>>> CreateKeywordGroup(
        Guid projectId,
        [FromBody] CreateKeywordGroupRequest request)
    {
        var command = new CreateKeywordGroupCommand(projectId, request.Name, request.ColorHex);
        var result = await Mediator.Send(command);
        return CreatedSuccess($"/api/v1/projects/{projectId}/keyword-groups/{result.Id}", result, "Keyword group created.");
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteKeywordGroup(Guid projectId, Guid id)
    {
        var result = await Mediator.Send(new DeleteKeywordGroupCommand(projectId, id));
        return Success(result, "Keyword group deleted.");
    }
}

public class CreateKeywordGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; } = "#3B82F6";
}
