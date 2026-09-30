using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Commands;

public record AssignUserProjectCommand(Guid UserId, Guid ProjectId, ProjectAccessLevel AccessLevel) : IRequest<UserProjectMembershipDto>;

public class AssignUserProjectCommandValidator : AbstractValidator<AssignUserProjectCommand>
{
    public AssignUserProjectCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}

public class AssignUserProjectCommandHandler : IRequestHandler<AssignUserProjectCommand, UserProjectMembershipDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUser;

    public AssignUserProjectCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUser)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUser = currentUser;
    }

    public async Task<UserProjectMembershipDto> Handle(AssignUserProjectCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.UserId);
        }

        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);
        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.UserId == request.UserId && pm.ProjectId == request.ProjectId, cancellationToken);

        if (existingMember != null)
        {
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
            actionType: "User.ProjectAssigned",
            entityType: "ProjectMember",
            entityId: existingMember.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { request.UserId, user.Email, request.ProjectId, project.Name, AccessLevel = request.AccessLevel.ToString() },
            cancellationToken: cancellationToken);

        return new UserProjectMembershipDto
        {
            ProjectId = project.Id,
            ProjectName = project.Name,
            PrimaryDomain = project.PrimaryDomain,
            AccessLevel = existingMember.AccessLevel,
            AssignedAt = existingMember.AssignedAt
        };
    }
}
