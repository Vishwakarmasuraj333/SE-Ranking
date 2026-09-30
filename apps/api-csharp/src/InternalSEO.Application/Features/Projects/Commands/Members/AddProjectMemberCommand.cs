using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Commands.Members;

public record AddProjectMemberCommand(Guid ProjectId, Guid UserId, ProjectAccessLevel AccessLevel) : IRequest<ProjectMemberDto>;

public class AddProjectMemberCommandValidator : AbstractValidator<AddProjectMemberCommand>
{
    public AddProjectMemberCommandValidator()
    {
        RuleFor(v => v.ProjectId).NotEmpty();
        RuleFor(v => v.UserId).NotEmpty();
    }
}

public class AddProjectMemberCommandHandler : IRequestHandler<AddProjectMemberCommand, ProjectMemberDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;

    public AddProjectMemberCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<ProjectMemberDto> Handle(AddProjectMemberCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        // Only SuperAdmin or Project Owner can add members
        if (!_currentUser.IsSuperAdmin)
        {
            var currentUserId = _currentUser.UserId ?? Guid.Empty;
            var isOwner = project.Members.Any(m => m.UserId == currentUserId && m.AccessLevel == ProjectAccessLevel.Owner);
            if (!isOwner)
            {
                throw new ForbiddenException("Only Super Admins or Project Owners can assign members.");
            }
        }

        var targetUser = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.IsActive, cancellationToken);

        if (targetUser == null)
        {
            throw new NotFoundException(nameof(User), request.UserId);
        }

        var existingMember = project.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (existingMember != null)
        {
            // Update existing access level
            existingMember.AccessLevel = request.AccessLevel;
        }
        else
        {
            existingMember = new ProjectMember
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                UserId = request.UserId,
                AccessLevel = request.AccessLevel,
                AssignedAt = DateTimeOffset.UtcNow,
                AssignedBy = _currentUser.UserId ?? Guid.Empty
            };
            _context.ProjectMembers.Add(existingMember);
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Project.MemberAdded",
            entityType: "ProjectMember",
            entityId: existingMember.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { request.UserId, UserEmail = targetUser.Email, AccessLevel = request.AccessLevel.ToString() },
            cancellationToken: cancellationToken);

        return new ProjectMemberDto
        {
            Id = existingMember.Id,
            ProjectId = request.ProjectId,
            UserId = targetUser.Id,
            Email = targetUser.Email,
            FullName = targetUser.FullName,
            Role = targetUser.UserRoles.FirstOrDefault()?.Role.Name ?? string.Empty,
            AccessLevel = existingMember.AccessLevel,
            AssignedAt = existingMember.AssignedAt
        };
    }
}
