using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.Commands;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Application.Features.Competitors.Queries;
using InternalSEO.Application.Features.Keywords.Commands.BulkOperations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/competitors")]
public class CompetitorsController : BaseApiController
{
    /// <summary>
    /// List all competitors configured for the project (max 5).
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<CompetitorDto>>>> GetCompetitors(
        [FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetCompetitorsQuery(projectId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Add a new competitor to the project (enforces max 5, valid domain, no duplicates).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<CompetitorDto>>> AddCompetitor(
        [FromRoute] Guid projectId,
        [FromBody] AddCompetitorRequest request)
    {
        var command = new AddCompetitorCommand(projectId, request.Name, request.Domain, request.Notes);
        var result = await Mediator.Send(command);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Update competitor details (name, domain, notes).
    /// </summary>
    [HttpPut("{competitorId:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<CompetitorDto>>> UpdateCompetitor(
        [FromRoute] Guid projectId,
        [FromRoute] Guid competitorId,
        [FromBody] UpdateCompetitorRequest request)
    {
        var command = new UpdateCompetitorCommand(projectId, competitorId, request.Name, request.Domain, request.Notes);
        var result = await Mediator.Send(command);
        return Success(result.Data!);
    }

    /// <summary>
    /// Delete a competitor and all associated rank observation records.
    /// </summary>
    [HttpDelete("{competitorId:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCompetitor(
        [FromRoute] Guid projectId,
        [FromRoute] Guid competitorId)
    {
        var command = new DeleteCompetitorCommand(projectId, competitorId);
        var result = await Mediator.Send(command);
        return Success(result.Data);
    }

    /// <summary>
    /// Get side-by-side SERP visibility overview comparing target domain against all competitors.
    /// </summary>
    [HttpGet("overview")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<CompetitorOverviewDto>>> GetOverview(
        [FromRoute] Guid projectId,
        [FromQuery] int days = 30)
    {
        var result = await Mediator.Send(new GetCompetitorOverviewQuery(projectId, days));
        return Success(result.Data!);
    }

    /// <summary>
    /// Get side-by-side SERP visibility and overlap analysis comparing target domain against all competitors.
    /// </summary>
    [HttpGet("visibility")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<CompetitorVisibilityResponseDto>>> GetVisibility(
        [FromRoute] Guid projectId,
        [FromQuery] int days = 30)
    {
        var result = await Mediator.Send(new GetCompetitorVisibilityQuery(projectId, days));
        return Success(result.Data!);
    }


    /// <summary>
    /// Get keyword ranking matrix comparing positions across target domain and all competitors.
    /// </summary>
    [HttpGet("keywords")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<CompetitorKeywordsResponseDto>>> GetKeywords(
        [FromRoute] Guid projectId,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var result = await Mediator.Send(new GetCompetitorKeywordsQuery(projectId, search, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// Get keyword gap analysis comparing keywords where competitors rank in Top 20 but target domain does not.
    /// </summary>
    [HttpGet("gap")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<CompetitorGapResponseDto>>> GetKeywordGap(
        [FromRoute] Guid projectId,
        [FromQuery] string? search = null,
        [FromQuery] Guid? competitorId = null,
        [FromQuery] string? sort = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var result = await Mediator.Send(new GetCompetitorGapQuery(projectId, search, competitorId, sort, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// One-click mutation to add an inactive keyword from the gap analysis to active tracking.
    /// </summary>
    [HttpPost("gap/{keywordId:guid}/track")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> TrackGapKeyword(
        [FromRoute] Guid projectId,
        [FromRoute] Guid keywordId)
    {
        var count = await Mediator.Send(new BulkUpdateKeywordStatusCommand(projectId, new List<Guid> { keywordId }, true));
        return Success(count > 0, "Keyword added to tracked rankings.");
    }
}

public record AddCompetitorRequest(string Name, string Domain, string? Notes);
public record UpdateCompetitorRequest(string Name, string Domain, string? Notes);
