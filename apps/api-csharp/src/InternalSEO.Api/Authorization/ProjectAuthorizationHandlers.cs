using System.Security.Claims;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Api.Authorization;

public class ProjectMemberRequirement : IAuthorizationRequirement
{
}

public class ProjectMemberAuthorizationHandler : AuthorizationHandler<ProjectMemberRequirement>
{
    private readonly IApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProjectMemberAuthorizationHandler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ProjectMemberRequirement requirement)
    {
        if (context.User.IsInRole(SystemRoles.SuperAdmin))
        {
            context.Succeed(requirement);
            return;
        }

        var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return;

        var routeValue = httpContext.GetRouteValue("projectId") ?? httpContext.GetRouteValue("id");
        if (routeValue == null || !Guid.TryParse(routeValue.ToString(), out var projectId))
        {
            return;
        }

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (isMember)
        {
            context.Succeed(requirement);
        }
    }
}

public class ProjectWriterRequirement : IAuthorizationRequirement
{
}

public class ProjectWriterAuthorizationHandler : AuthorizationHandler<ProjectWriterRequirement>
{
    private readonly IApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProjectWriterAuthorizationHandler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ProjectWriterRequirement requirement)
    {
        if (context.User.IsInRole(SystemRoles.SuperAdmin))
        {
            context.Succeed(requirement);
            return;
        }

        var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return;

        var routeValue = httpContext.GetRouteValue("projectId") ?? httpContext.GetRouteValue("id");
        if (routeValue == null || !Guid.TryParse(routeValue.ToString(), out var projectId))
        {
            return;
        }

        var membership = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (membership != null && membership.AccessLevel != ProjectAccessLevel.ReadOnly)
        {
            context.Succeed(requirement);
        }
    }
}
