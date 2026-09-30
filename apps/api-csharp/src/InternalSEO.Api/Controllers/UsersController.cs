using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Users.Commands;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Application.Features.Users.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize(Policy = "RequireSuperAdmin")]
[Route("api/v1/admin/[controller]")]
public class UsersController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<AdminUserDto>>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetAdminUsersQuery(search, role, isActive, page, pageSize));
        return Success(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AdminUserDetailDto>>> GetUserById(Guid id)
    {
        var result = await Mediator.Send(new GetAdminUserDetailQuery(id));
        return Success(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateAdminUserCommand(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.Role,
            request.PhoneNumber);

        var result = await Mediator.Send(command);
        return CreatedSuccess($"/api/v1/admin/users/{result.Id}", result, "User created successfully.");
    }

    [HttpPut("{id:guid}/role")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var result = await Mediator.Send(new UpdateUserRoleCommand(id, request.Role));
        return Success(result, "User role updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var result = await Mediator.Send(new UpdateUserStatusCommand(id, request.IsActive));
        return Success(result, "User status updated successfully.");
    }

    [HttpPost("{id:guid}/projects")]
    public async Task<ActionResult<ApiResponse<UserProjectMembershipDto>>> AssignUserProject(Guid id, [FromBody] AssignUserProjectRequest request)
    {
        var result = await Mediator.Send(new AssignUserProjectCommand(id, request.ProjectId, request.AccessLevel));
        return Success(result, "User project assignment updated successfully.");
    }

    [HttpDelete("{id:guid}/projects/{projectId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> UnassignUserProject(Guid id, Guid projectId)
    {
        var result = await Mediator.Send(new UnassignUserProjectCommand(id, projectId));
        return Success(result, "User unassigned from project successfully.");
    }
}
