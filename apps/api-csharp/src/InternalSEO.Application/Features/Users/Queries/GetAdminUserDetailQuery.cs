using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Queries;

public record GetAdminUserDetailQuery(Guid Id) : IRequest<AdminUserDetailDto>;

public class GetAdminUserDetailQueryValidator : AbstractValidator<GetAdminUserDetailQuery>
{
    public GetAdminUserDetailQueryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class GetAdminUserDetailQueryHandler : IRequestHandler<GetAdminUserDetailQuery, AdminUserDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminUserDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminUserDetailDto> Handle(GetAdminUserDetailQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
                .ThenInclude(pm => pm.Project)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }

        return new AdminUserDetailDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            PhoneNumber = user.PhoneNumber,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            ProjectMemberships = user.ProjectMemberships
                .Where(pm => !pm.Project.IsArchived)
                .Select(pm => new UserProjectMembershipDto
                {
                    ProjectId = pm.ProjectId,
                    ProjectName = pm.Project.Name,
                    PrimaryDomain = pm.Project.PrimaryDomain,
                    AccessLevel = pm.AccessLevel,
                    AssignedAt = pm.AssignedAt
                })
                .OrderBy(pm => pm.ProjectName)
                .ToList()
        };
    }
}
