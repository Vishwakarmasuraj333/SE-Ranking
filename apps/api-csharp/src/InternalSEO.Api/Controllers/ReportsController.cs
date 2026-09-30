using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Reports.Commands;
using InternalSEO.Application.Features.Reports.DTOs;
using InternalSEO.Application.Features.Reports.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public record CreateReportRequest(
    string Title,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    List<string> Sections,
    string? ExecutiveNotes
);

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/reports")]
public class ReportsController : BaseApiController
{
    /// <summary>
    /// Lists all historical report snapshots for a project.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<ReportSummaryDto>>>> GetReports([FromRoute] Guid projectId)
    {
        var result = await Mediator.Send(new GetProjectReportsQuery(projectId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves a single frozen report snapshot by ID.
    /// </summary>
    [HttpGet("{reportId:guid}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<ReportDetailDto>>> GetReportDetail(
        [FromRoute] Guid projectId,
        [FromRoute] Guid reportId)
    {
        var result = await Mediator.Send(new GetReportDetailQuery(projectId, reportId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Compiles and generates a new immutable report snapshot.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ReportDetailDto>>> CreateReport(
        [FromRoute] Guid projectId,
        [FromBody] CreateReportRequest request)
    {
        var result = await Mediator.Send(new CreateReportCommand(
            projectId,
            request.Title,
            request.StartDate,
            request.EndDate,
            request.Sections ?? new List<string>(),
            request.ExecutiveNotes));

        return CreatedAtAction(
            nameof(GetReportDetail),
            new { projectId, reportId = result.Data!.Id },
            result);
    }

    /// <summary>
    /// Deletes a report snapshot (SuperAdmin only).
    /// </summary>
    [HttpDelete("{reportId:guid}")]
    [Authorize(Policy = "RequireSuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteReport(
        [FromRoute] Guid projectId,
        [FromRoute] Guid reportId)
    {
        var result = await Mediator.Send(new DeleteReportCommand(projectId, reportId));
        return Success(result.Data!);
    }
}
