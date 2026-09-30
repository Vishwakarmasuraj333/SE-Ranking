using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Commands;

public record UnassignUserProjectCommand(Guid UserId, Guid ProjectId) : IRequest<bool>;

public class UnassignUserProjectCommandValidator : AbstractValidator<UnassignUserProjectCommand>
{
    public UnassignUserProjectCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}

public class UnassignUserProjectCommandHandler : IRequestHandler<UnassignUserProjectCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public UnassignUserProjectCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<bool> Handle(UnassignUserProjectCommand request, CancellationToken cancellationToken)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.UserId == request.UserId && pm.ProjectId == request.ProjectId, cancellationToken);

        if (member == null)
        {
            throw new NotFoundException(nameof(ProjectMember), $"{request.UserId}/{request.ProjectId}");
        }

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "User.ProjectUnassigned",
            entityType: "ProjectMember",
            entityId: member.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { request.UserId, request.ProjectId },
            cancellationToken: cancellationToken);

        return true;
    }
}
