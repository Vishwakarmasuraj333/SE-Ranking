using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Users.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Users.Queries;

public record GetAdminUsersQuery(
    string? Search = null,
    string? Role = null,
    bool? IsActive = null,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PaginatedList<AdminUserDto>>;

public class GetAdminUsersQueryValidator : AbstractValidator<GetAdminUsersQuery>
{
    public GetAdminUsersQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public class GetAdminUsersQueryHandler : IRequestHandler<GetAdminUsersQuery, PaginatedList<AdminUserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<AdminUserDto>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.ProjectMemberships)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(search) ||
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var targetRole = request.Role.Trim();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == targetRole));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = (u.FirstName + " " + u.LastName).Trim(),
                Role = u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? string.Empty,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                ProjectCount = u.ProjectMemberships.Count
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<AdminUserDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
