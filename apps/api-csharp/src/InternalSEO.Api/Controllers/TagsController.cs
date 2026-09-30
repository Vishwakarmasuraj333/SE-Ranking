using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Application.Features.Keywords.Queries.Metadata;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize]
[Route("api/v1/projects/{projectId:guid}/tags")]
public class TagsController : BaseApiController
{
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<TagDto>>>> GetTags(Guid projectId)
    {
        var result = await Mediator.Send(new GetTagsQuery(projectId));
        return Success(result);
    }
}
