using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Dashboard.DTOs;
using InternalSEO.Application.Features.Dashboard.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize]
public class DashboardController : BaseApiController
{
    [HttpGet("/api/v1/projects/{projectId:guid}/dashboard")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<ProjectDashboardDto>>> GetProjectDashboard([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetProjectDashboardQuery(projectId));
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<GlobalDashboardDto>>> GetGlobalDashboard()
    {
        var result = await Mediator.Send(new GetGlobalDashboardQuery());
        return Ok(result);
    }
}
