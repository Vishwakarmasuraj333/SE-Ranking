using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.Commands;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Application.Features.GoogleAnalytics.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/integrations/ga4")]
public class Ga4PerformanceController : BaseApiController
{
    [HttpGet("status")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<Ga4ConnectionDto?>>> GetStatus([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGa4ConnectionStatusQuery(projectId));
        return Ok(result);
    }

    [HttpPost("sync")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<string>>> TriggerSync([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new TriggerGa4SyncCommand(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("overview")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<Ga4OverviewDto>>> GetOverview(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        var result = await Mediator.Send(new GetGa4OverviewQuery(projectId, startDate, endDate));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("pages")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<Ga4PageRowDto>>>> GetPages(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? sortBy = "sessions",
        [FromQuery] bool sortDescending = true)
    {
        var result = await Mediator.Send(new GetGa4PagesQuery(
            projectId, startDate, endDate, search, page, pageSize, sortBy, sortDescending));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
