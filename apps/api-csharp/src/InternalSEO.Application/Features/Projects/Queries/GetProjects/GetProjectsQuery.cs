using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Queries.GetProjects;

public record GetProjectsQuery(
    string? Search = null,
    ProjectStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 25) : IRequest<PaginatedList<ProjectDto>>;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, PaginatedList<ProjectDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProjectsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Projects
            .Include(p => p.Members)
            .Where(p => !p.IsArchived)
            .AsNoTracking();

        // Project Isolation: Non-SuperAdmins only see projects they are members of
        if (!_currentUser.IsSuperAdmin)
        {
            var userId = _currentUser.UserId ?? Guid.Empty;
            query = query.Where(p => p.Members.Any(m => m.UserId == userId));
        }

        // Filtering
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.PrimaryDomain.ToLower().Contains(search));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        var currentUserId = _currentUser.UserId;

        var projectedQuery = query.OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                PrimaryDomain = p.PrimaryDomain,
                Protocol = p.Protocol,
                Industry = p.Industry,
                CountryCode = p.CountryCode,
                PrimaryLocation = p.PrimaryLocation,
                LanguageCode = p.LanguageCode,
                Timezone = p.Timezone,
                DefaultSearchEngine = p.DefaultSearchEngine,
                DefaultDevice = p.DefaultDevice,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                MemberCount = p.Members.Count,
                UserAccessLevel = currentUserId.HasValue 
                    ? p.Members.Where(m => m.UserId == currentUserId.Value).Select(m => m.AccessLevel.ToString()).FirstOrDefault()
                    : null
            });

        return await PaginatedList<ProjectDto>.CreateAsync(
            projectedQuery,
            request.PageNumber,
            request.PageSize,
            cancellationToken);
    }
}
