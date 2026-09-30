using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Audit.Commands.StartCrawl;
using InternalSEO.Application.Features.Audit.Commands.UpdateCrawlSettings;
using InternalSEO.Application.Features.Audit.DTOs;
using InternalSEO.Application.Features.Audit.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public record UpdateCrawlSettingsRequest(
    int CrawlMaxPages,
    int CrawlMaxDepth,
    int CrawlConcurrency,
    int CrawlRateLimitMs,
    bool CrawlRespectRobotsTxt,
    string CrawlUserAgent
);

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/audit")]
public class AuditController : BaseApiController
{
    /// <summary>
    /// Retrieves technical audit overview, health score, category breakdown, and recent crawl runs.
    /// </summary>
    [HttpGet("overview")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<AuditOverviewDto>>> GetOverview(
        [FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetAuditOverviewQuery(projectId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves current or specific crawl run execution status and real-time progress.
    /// </summary>
    [HttpGet("status")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<CrawlRunDto?>>> GetStatus(
        [FromRoute] Guid projectId,
        [FromQuery] Guid? crawlRunId = null)
    {
        var result = await Mediator.Send(new GetCrawlStatusQuery(projectId, crawlRunId));
        return Success(result.Data);
    }

    /// <summary>
    /// Initiates an asynchronous technical audit crawl for the project.
    /// </summary>
    [HttpPost("crawl")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<Guid>>> StartCrawl(
        [FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new StartCrawlCommand(projectId));
        return CreatedSuccess(
            $"/api/v1/projects/{projectId}/audit/status?crawlRunId={result.Data}",
            result.Data,
            result.Message);
    }

    /// <summary>
    /// Retrieves paginated detected audit issues for a crawl run with optional filters.
    /// </summary>
    [HttpGet("issues")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<AuditIssueDto>>>> GetIssues(
        [FromRoute] Guid projectId,
        [FromQuery] Guid? crawlRunId = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetAuditIssuesQuery(
            projectId, crawlRunId, severity, category, search, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves detailed diagnostic information and evidence payload for a specific issue.
    /// </summary>
    [HttpGet("issues/{issueId:guid}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<AuditIssueDetailDto>>> GetIssueDetail(
        [FromRoute] Guid projectId,
        [FromRoute] Guid issueId)
    {
        var result = await Mediator.Send(new GetAuditIssueDetailQuery(projectId, issueId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves paginated crawled pages list and metadata for a crawl run.
    /// </summary>
    [HttpGet("pages")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<CrawlPageDto>>>> GetPages(
        [FromRoute] Guid projectId,
        [FromQuery] Guid? crawlRunId = null,
        [FromQuery] int? statusCode = null,
        [FromQuery] bool? isIndexable = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetCrawlPagesQuery(
            projectId, crawlRunId, statusCode, isIndexable, search, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves the crawl configuration settings for the project.
    /// </summary>
    [HttpGet("settings")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<ProjectSettingsDto>>> GetSettings(
        [FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetCrawlSettingsQuery(projectId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Updates the crawl configuration settings for the project.
    /// </summary>
    [HttpPut("settings")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ProjectSettingsDto>>> UpdateSettings(
        [FromRoute] Guid projectId,
        [FromBody] UpdateCrawlSettingsRequest request)
    {
        var command = new UpdateCrawlSettingsCommand(
            projectId,
            request.CrawlMaxPages,
            request.CrawlMaxDepth,
            request.CrawlConcurrency,
            request.CrawlRateLimitMs,
            request.CrawlRespectRobotsTxt,
            request.CrawlUserAgent);

        var result = await Mediator.Send(command);
        return Success(result.Data!, result.Message);
    }
}
