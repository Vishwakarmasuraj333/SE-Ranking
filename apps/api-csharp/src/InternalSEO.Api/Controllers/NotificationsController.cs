using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Notifications.Commands.MarkAllRead;
using InternalSEO.Application.Features.Notifications.Commands.MarkRead;
using InternalSEO.Application.Features.Notifications.DTOs;
using InternalSEO.Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Retrieves paginated notifications feed for the current authenticated user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<NotificationDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? unreadOnly = null,
        [FromQuery] Guid? projectId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetNotificationsQuery(page, pageSize, unreadOnly, projectId),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets the unread notifications count for the current authenticated user.
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<UnreadCountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetUnreadCountQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Marks a specific notification as read.
    /// </summary>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new MarkNotificationReadCommand(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Marks all unread notifications for the current user as read.
    /// </summary>
    [HttpPost("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkAllAsRead(
        [FromQuery] Guid? projectId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new MarkAllNotificationsReadCommand(projectId), cancellationToken);
        return Ok(result);
    }
}
