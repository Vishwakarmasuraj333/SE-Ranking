using System;
using System.Threading.Tasks;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.ActivityLogs.DTOs;
using InternalSEO.Application.Features.ActivityLogs.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize(Policy = "RequireSuperAdmin")]
[Route("api/v1/admin/activity-logs")]
public class AdminActivityLogsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<ActivityLogDto>>>> GetActivityLogs(
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? actorId,
        [FromQuery] string? entityType,
        [FromQuery] string? actionType,
        [FromQuery] DateTimeOffset? fromUtc,
        [FromQuery] DateTimeOffset? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetActivityLogsQuery(
            ProjectId: projectId,
            ActorId: actorId,
            EntityType: entityType,
            ActionType: actionType,
            FromUtc: fromUtc,
            ToUtc: toUtc,
            PageNumber: page,
            PageSize: pageSize
        );

        var result = await Mediator.Send(query);
        return Success(result);
    }
}
