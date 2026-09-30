using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected ActionResult<ApiResponse<T>> Success<T>(T data, string? message = null)
    {
        var correlationId = HttpContext.Items["X-Correlation-ID"]?.ToString();
        var meta = new ApiMeta
        {
            CorrelationId = correlationId,
            Timestamp = DateTimeOffset.UtcNow
        };

        return Ok(ApiResponse<T>.Succeeded(data, message, meta));
    }

    protected ActionResult<ApiResponse<T>> CreatedSuccess<T>(string uri, T data, string? message = null)
    {
        var correlationId = HttpContext.Items["X-Correlation-ID"]?.ToString();
        var meta = new ApiMeta
        {
            CorrelationId = correlationId,
            Timestamp = DateTimeOffset.UtcNow
        };

        return Created(uri, ApiResponse<T>.Succeeded(data, message, meta));
    }
}
