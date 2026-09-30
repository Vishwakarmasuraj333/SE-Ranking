using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Queries.GetProjectById;

public record GetProjectByIdQuery(Guid Id) : IRequest<ProjectDetailDto>;

public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, ProjectDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProjectByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ProjectDetailDto> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Creator)
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Domain.Entities.Project), request.Id);
        }

        // Project Isolation Check: User must be SuperAdmin or a Member
        if (!_currentUser.IsSuperAdmin)
        {
            var userId = _currentUser.UserId ?? Guid.Empty;
            var isMember = project.Members.Any(m => m.UserId == userId);
            if (!isMember)
            {
                throw new ForbiddenException("You are not authorized to view this project.");
            }
        }

        var currentUserId = _currentUser.UserId;

        return new ProjectDetailDto
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
            CreatedBy = project.CreatedBy,
            CreatorEmail = project.Creator?.Email ?? string.Empty,
            MemberCount = project.Members.Count,
            UserAccessLevel = currentUserId.HasValue
                ? project.Members.Where(m => m.UserId == currentUserId.Value).Select(m => m.AccessLevel.ToString()).FirstOrDefault()
                : null,
            Members = project.Members.Select(m => new ProjectMemberDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                UserId = m.UserId,
                Email = m.User.Email,
                FullName = m.User.FullName,
                Role = m.User.UserRoles.FirstOrDefault()?.Role.Name ?? string.Empty,
                AccessLevel = m.AccessLevel,
                AssignedAt = m.AssignedAt
            }).ToList()
        };
    }
}
