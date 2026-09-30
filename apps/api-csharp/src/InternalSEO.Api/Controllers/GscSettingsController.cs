using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.Commands;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Application.Features.GoogleIntegrations.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public record BindGscPropertyRequest(string PropertyIdentifier);
public record CompleteGscOAuthCallbackRequest(string Code, string RedirectUri, string? State);

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/settings/integrations/gsc")]
public class GscSettingsController : BaseApiController
{
    [HttpGet("")]
    [HttpGet("status")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<GscConnectionDto?>>> GetStatus([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGscConnectionStatusQuery(projectId));
        return Ok(result);
    }

    [HttpGet("auth-url")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<GscAuthUrlDto>>> GetAuthUrl([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGscAuthUrlCommand(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("callback")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<GscConnectionDto>>> CompleteCallback(
        [FromRoute] Guid projectId,
        [FromBody] CompleteGscOAuthCallbackRequest request)
    {
        var result = await Mediator.Send(new CompleteGscOAuthCallbackCommand(
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
    public async Task<ActionResult<ApiResponse<IReadOnlyList<GscPropertyDto>>>> GetProperties([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetGscPropertiesQuery(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("bind")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<GscConnectionDto>>> BindProperty(
        [FromRoute] Guid projectId,
        [FromBody] BindGscPropertyRequest request)
    {
        var result = await Mediator.Send(new BindGscPropertyCommand(projectId, request.PropertyIdentifier));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("disconnect")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> Disconnect([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new DisconnectGscCommand(projectId));
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
