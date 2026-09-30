using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Rankings.DTOs;
using InternalSEO.Application.Features.Rankings.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/rankings")]
public class RankingsController : BaseApiController
{
    /// <summary>
    /// Retrieves calculated rankings overview metrics and historical trend series for the project.
    /// </summary>
    [HttpGet("overview")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<RankingsOverviewDto>>> GetOverview(
        [FromRoute] Guid projectId,
        [FromQuery] string timeRange = "week",
        [FromQuery] string metric = "average_position")
    {
        var result = await Mediator.Send(new GetRankingsOverviewQuery(projectId, timeRange, metric));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves comprehensive rankings summary dashboard data (KPIs, distribution buckets, SERP movements, top/jumped/dropped, pages, competitors).
    /// </summary>
    [HttpGet("summary")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<RankingsSummaryDto>>> GetSummary(
        [FromRoute] Guid projectId,
        [FromQuery] int days = 30)
    {
        var result = await Mediator.Send(new GetRankingsSummaryQuery(projectId, days));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves detailed ranking matrix with distribution headers, cannibalization detection, and daily position history.
    /// </summary>
    [HttpGet("detailed")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<RankingsDetailedResponseDto>>> GetDetailed(
        [FromRoute] Guid projectId,
        [FromQuery] string positionFilter = "all",
        [FromQuery] int? minPosition = null,
        [FromQuery] int? maxPosition = null,
        [FromQuery] string? changesOnly = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? cannibalizedOnly = null,
        [FromQuery] string? device = null,
        [FromQuery] string metric = "average_position",
        [FromQuery] string timeRange = "1m",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var result = await Mediator.Send(new GetRankingsDetailedQuery(
            projectId,
            positionFilter,
            minPosition,
            maxPosition,
            changesOnly,
            search,
            cannibalizedOnly,
            device,
            metric,
            timeRange,
            page,
            pageSize
        ));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves historical comparison data between baseline and current check dates with trajectory points and position distribution.
    /// </summary>
    [HttpGet("historical")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<RankingsHistoricalResponseDto>>> GetHistorical(
        [FromRoute] Guid projectId,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] string positionFilter = "all",
        [FromQuery] int? minPosition = null,
        [FromQuery] int? maxPosition = null,
        [FromQuery] string? changesOnly = null,
        [FromQuery] string? search = null,
        [FromQuery] string? device = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var result = await Mediator.Send(new GetRankingsHistoricalQuery(
            projectId,
            dateFrom,
            dateTo,
            positionFilter,
            minPosition,
            maxPosition,
            changesOnly,
            search,
            device,
            page,
            pageSize
        ));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves latest ranking positions for tracked keywords in the project.
    /// </summary>
    [HttpGet("latest")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<KeywordRankDto>>>> GetLatest(
        [FromRoute] Guid projectId,
        [FromQuery] string? search = null,
        [FromQuery] string? device = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var result = await Mediator.Send(new GetLatestRankingsQuery(projectId, search, device, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves chronological ranking history observations for a specific keyword in the project.
    /// </summary>
    [HttpGet("history/{keywordId}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<RankObservationHistoryDto>>>> GetKeywordHistory(
        [FromRoute] Guid projectId,
        [FromRoute] Guid keywordId,
        [FromQuery] int days = 30)
    {
        var result = await Mediator.Send(new GetKeywordRankingHistoryQuery(projectId, keywordId, days));
        return Success(result.Data!);
    }
}
