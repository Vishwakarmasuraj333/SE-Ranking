using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Commands.UpdateProject;

public record UpdateProjectCommand : IRequest<ProjectDto>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Industry { get; init; }
    public string? PrimaryLocation { get; init; }
    public string Timezone { get; init; } = "UTC";
    public string DefaultSearchEngine { get; init; } = "google";
    public string DefaultDevice { get; init; } = "desktop";
    public ProjectStatus Status { get; init; } = ProjectStatus.Active;
}

public class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
{
    public UpdateProjectCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
    }
}

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, ProjectDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;

    public UpdateProjectCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<ProjectDto> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Domain.Entities.Project), request.Id);
        }

        // Project Authorization Check: SuperAdmin or Member with non-ReadOnly access
        if (!_currentUser.IsSuperAdmin)
        {
            var userId = _currentUser.UserId ?? Guid.Empty;
            var membership = project.Members.FirstOrDefault(m => m.UserId == userId);

            if (membership == null)
            {
                throw new ForbiddenException("You are not a member of this project.");
            }

            if (membership.AccessLevel == ProjectAccessLevel.ReadOnly)
            {
                throw new ForbiddenException("Viewers with ReadOnly access cannot modify project settings.");
            }
        }

        // Apply updates
        project.Name = request.Name.Trim();
        project.Industry = request.Industry?.Trim();
        project.PrimaryLocation = request.PrimaryLocation?.Trim();
        project.Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? project.Timezone : request.Timezone.Trim();
        project.DefaultSearchEngine = string.IsNullOrWhiteSpace(request.DefaultSearchEngine) ? project.DefaultSearchEngine : request.DefaultSearchEngine.Trim().ToLowerInvariant();
        project.DefaultDevice = string.IsNullOrWhiteSpace(request.DefaultDevice) ? project.DefaultDevice : request.DefaultDevice.Trim().ToLowerInvariant();
        project.Status = request.Status;
        project.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Project.Updated",
            entityType: "Project",
            entityId: project.Id.ToString(),
            projectId: project.Id,
            payload: new { project.Name, project.Status, project.Timezone },
            cancellationToken: cancellationToken);

        var currentUserId = _currentUser.UserId;

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            PrimaryDomain = project.PrimaryDomain,
            Protocol = project.Protocol,
            Industry = project.Industry,
            CountryCode = project.CountryCode,
            PrimaryLocation = project.PrimaryLocation,
            LanguageCode = project.LanguageCode,
            Timezone = project.Timezone,
            DefaultSearchEngine = project.DefaultSearchEngine,
            DefaultDevice = project.DefaultDevice,
            Status = project.Status,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            MemberCount = project.Members.Count,
            UserAccessLevel = currentUserId.HasValue
                ? project.Members.Where(m => m.UserId == currentUserId.Value).Select(m => m.AccessLevel.ToString()).FirstOrDefault()
                : null
        };
    }
}
