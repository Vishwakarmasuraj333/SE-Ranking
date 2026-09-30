using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Commands.Members;

public record RemoveProjectMemberCommand(Guid ProjectId, Guid UserId) : IRequest<bool>;

public class RemoveProjectMemberCommandHandler : IRequestHandler<RemoveProjectMemberCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;

    public RemoveProjectMemberCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<bool> Handle(RemoveProjectMemberCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        // Only SuperAdmin or Project Owner can remove members
        if (!_currentUser.IsSuperAdmin)
        {
            var currentUserId = _currentUser.UserId ?? Guid.Empty;
            var isOwner = project.Members.Any(m => m.UserId == currentUserId && m.AccessLevel == ProjectAccessLevel.Owner);
            if (!isOwner)
            {
                throw new ForbiddenException("Only Super Admins or Project Owners can remove members.");
            }
        }

        var member = project.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (member == null)
        {
            throw new NotFoundException(nameof(ProjectMember), request.UserId);
        }

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Project.MemberRemoved",
            entityType: "ProjectMember",
            entityId: member.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { request.UserId },
            cancellationToken: cancellationToken);

        return true;
    }
}
