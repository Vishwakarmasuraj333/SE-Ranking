using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.Commands;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Application.Features.GoogleIntegrations.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/integrations/gsc")]
public class GscPerformanceController : BaseApiController
{
    [HttpGet("status")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<GscConnectionDto?>>> GetStatus([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGscConnectionStatusQuery(projectId));
        return Ok(result);
    }

    [HttpPost("sync")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<string>>> TriggerSync([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new TriggerGscSyncCommand(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("overview")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<GscPerformanceOverviewDto>>> GetOverview(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? device = null)
    {
        var result = await Mediator.Send(new GetGscPerformanceOverviewQuery(projectId, startDate, endDate, device));
        return Ok(result);
    }

    [HttpGet("queries")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<GscQueryRowDto>>>> GetQueries(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? search = null,
        [FromQuery] string? device = null,
        [FromQuery] string? country = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? sortBy = "clicks",
        [FromQuery] bool sortDescending = true)
    {
        var result = await Mediator.Send(new GetGscQueriesQuery(
            projectId, startDate, endDate, search, device, country, page, pageSize, sortBy, sortDescending));
        return Ok(result);
    }

    [HttpGet("queries/{queryText}")]
    [HttpGet("queries/{queryText}/history")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<GscQueryDetailDto>>> GetQueryHistory(
        [FromRoute] Guid projectId,
        [FromRoute] string queryText,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        var result = await Mediator.Send(new GetGscQueryHistoryQuery(projectId, queryText, startDate, endDate));
        return Ok(result);
    }

    [HttpGet("pages")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<GscPageRowDto>>>> GetPages(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? sortBy = "clicks",
        [FromQuery] bool sortDescending = true)
    {
        var result = await Mediator.Send(new GetGscPagesQuery(
            projectId, startDate, endDate, search, page, pageSize, sortBy, sortDescending));
        return Ok(result);
    }

    [HttpGet("devices")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<GscDeviceStatDto>>>> GetDeviceBreakdown(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        var result = await Mediator.Send(new GetGscDeviceBreakdownQuery(projectId, startDate, endDate));
        return Ok(result);
    }

    [HttpGet("countries")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<GscCountryStatDto>>>> GetCountryBreakdown(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] int topCount = 10)
    {
        var result = await Mediator.Send(new GetGscCountryBreakdownQuery(projectId, startDate, endDate, topCount));
        return Ok(result);
    }
}
