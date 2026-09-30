using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.Commands.AddComment;
using InternalSEO.Application.Features.Tasks.Commands.CreateTask;
using InternalSEO.Application.Features.Tasks.Commands.EnqueueVerification;
using InternalSEO.Application.Features.Tasks.Commands.PatchTaskStatus;
using InternalSEO.Application.Features.Tasks.Commands.UpdateTask;
using InternalSEO.Application.Features.Tasks.DTOs;
using InternalSEO.Application.Features.Tasks.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public record CreateTaskRequest(
    string Title,
    string? Description,
    string? AffectedUrl,
    string Priority,
    Guid? AssigneeId,
    DateOnly? DueDate,
    string? AcceptanceCriteria,
    Guid? SourceIssueId
);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    string? AffectedUrl,
    string Priority,
    Guid? AssigneeId,
    DateOnly? DueDate,
    string? AcceptanceCriteria
);

public record PatchTaskStatusRequest(
    string Status
);

public record AddTaskCommentRequest(
    string CommentText
);

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/tasks")]
public class TasksController : BaseApiController
{
    /// <summary>
    /// Retrieves paginated tasks for a project with optional filtering.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<TaskDto>>>> GetTasks(
        [FromRoute] Guid projectId,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] Guid? assigneeId = null,
        [FromQuery] Guid? sourceIssueId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetTasksQuery(
            projectId, status, priority, assigneeId, sourceIssueId, search, page, pageSize));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves detailed task information including source issue and verification history.
    /// </summary>
    [HttpGet("{taskId:guid}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<TaskDetailDto>>> GetTaskDetail(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId)
    {
        var result = await Mediator.Send(new GetTaskDetailQuery(projectId, taskId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Creates a new SEO remediation task (manual or spawned from an audit issue).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateTask(
        [FromRoute] Guid projectId,
        [FromBody] CreateTaskRequest request)
    {
        var command = new CreateTaskCommand(
            projectId,
            request.Title,
            request.Description,
            request.AffectedUrl,
            request.Priority ?? "Medium",
            request.AssigneeId,
            request.DueDate,
            request.AcceptanceCriteria,
            request.SourceIssueId);

        var result = await Mediator.Send(command);
        return CreatedSuccess($"/api/v1/projects/{projectId}/tasks/{result.Data}", result.Data, result.Message);
    }

    /// <summary>
    /// Updates all metadata fields of an existing task.
    /// </summary>
    [HttpPut("{taskId:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateTask(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId,
        [FromBody] UpdateTaskRequest request)
    {
        var command = new UpdateTaskCommand(
            projectId,
            taskId,
            request.Title,
            request.Description,
            request.AffectedUrl,
            request.Priority ?? "Medium",
            request.AssigneeId,
            request.DueDate,
            request.AcceptanceCriteria);

        var result = await Mediator.Send(command);
        return Success(result.Data, result.Message);
    }

    /// <summary>
    /// Transitions task status according to the valid state machine.
    /// </summary>
    [HttpPatch("{taskId:guid}/status")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> PatchStatus(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId,
        [FromBody] PatchTaskStatusRequest request)
    {
        var command = new PatchTaskStatusCommand(projectId, taskId, request.Status);
        var result = await Mediator.Send(command);
        return Success(result.Data, result.Message);
    }

    /// <summary>
    /// Enqueues an automated background recheck verification job for the task.
    /// </summary>
    [HttpPost("{taskId:guid}/verify")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<TaskVerificationDto>>> VerifyTask(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId)
    {
        var command = new EnqueueTaskVerificationCommand(projectId, taskId);
        var result = await Mediator.Send(command);
        return Accepted($"/api/v1/projects/{projectId}/tasks/{taskId}/verifications", result);
    }

    /// <summary>
    /// Retrieves historical verification attempts and diagnostic payloads for a task.
    /// </summary>
    [HttpGet("{taskId:guid}/verifications")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<TaskVerificationDto>>>> GetVerifications(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId)
    {
        var result = await Mediator.Send(new GetTaskVerificationsQuery(projectId, taskId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Retrieves discussion comments for a task.
    /// </summary>
    [HttpGet("{taskId:guid}/comments")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<List<TaskCommentDto>>>> GetComments(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId)
    {
        var result = await Mediator.Send(new GetTaskCommentsQuery(projectId, taskId));
        return Success(result.Data!);
    }

    /// <summary>
    /// Adds a new discussion comment to a task.
    /// </summary>
    [HttpPost("{taskId:guid}/comments")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<TaskCommentDto>>> AddComment(
        [FromRoute] Guid projectId,
        [FromRoute] Guid taskId,
        [FromBody] AddTaskCommentRequest request)
    {
        var command = new AddTaskCommentCommand(projectId, taskId, request.CommentText);
        var result = await Mediator.Send(command);
        return CreatedAtAction(
            nameof(GetComments),
            new { projectId, taskId },
            result);
    }
}
