using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.Commands;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Application.Features.GoogleAnalytics.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public record BindGa4PropertyRequest(string PropertyIdentifier);
public record CompleteGa4OAuthCallbackRequest(string Code, string RedirectUri, string? State);

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/settings/integrations/ga4")]
public class Ga4SettingsController : BaseApiController
{
    [HttpGet("")]
    [HttpGet("status")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<Ga4ConnectionDto?>>> GetStatus([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGa4ConnectionStatusQuery(projectId));
        return Ok(result);
    }

    [HttpGet("auth-url")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<Ga4AuthUrlDto>>> GetAuthUrl([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGa4AuthUrlCommand(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("callback")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<Ga4ConnectionDto>>> CompleteCallback(
        [FromRoute] Guid projectId,
        [FromBody] CompleteGa4OAuthCallbackRequest request)
    {
        var result = await Mediator.Send(new CompleteGa4OAuthCallbackCommand(
            projectId,
            request.Code,
            request.RedirectUri,
            request.State));

        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("properties")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Ga4PropertyDto>>>> GetProperties([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGa4PropertiesQuery(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("bind")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<Ga4ConnectionDto>>> BindProperty(
        [FromRoute] Guid projectId,
        [FromBody] BindGa4PropertyRequest request)
    {
        var result = await Mediator.Send(new BindGa4PropertyCommand(projectId, request.PropertyIdentifier));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("disconnect")]
    [Authorize(Policy = "RequireSuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> Disconnect([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new DisconnectGa4Command(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
