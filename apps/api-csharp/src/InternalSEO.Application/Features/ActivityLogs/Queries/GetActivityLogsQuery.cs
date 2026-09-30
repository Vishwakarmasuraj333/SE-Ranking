using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.ActivityLogs.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.ActivityLogs.Queries;

public record GetActivityLogsQuery(
    Guid? ProjectId = null,
    Guid? ActorId = null,
    string? EntityType = null,
    string? ActionType = null,
    DateTimeOffset? FromUtc = null,
    DateTimeOffset? ToUtc = null,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PaginatedList<ActivityLogDto>>;

public class GetActivityLogsQueryValidator : AbstractValidator<GetActivityLogsQuery>
{
    public GetActivityLogsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.ToUtc)
            .GreaterThanOrEqualTo(x => x.FromUtc!.Value)
            .When(x => x.FromUtc.HasValue && x.ToUtc.HasValue)
            .WithMessage("ToUtc must be greater than or equal to FromUtc.");
    }
}

public class GetActivityLogsQueryHandler : IRequestHandler<GetActivityLogsQuery, PaginatedList<ActivityLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetActivityLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ActivityLogDto>> Handle(GetActivityLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ActivityLogs
            .AsNoTracking()
            .Include(a => a.Project)
            .AsQueryable();

        if (request.ProjectId.HasValue)
        {
            query = query.Where(a => a.ProjectId == request.ProjectId.Value);
        }

        if (request.ActorId.HasValue)
        {
            query = query.Where(a => a.ActorId == request.ActorId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.EntityType))
        {
            var entityType = request.EntityType.Trim();
            query = query.Where(a => a.EntityType == entityType);
        }

        if (!string.IsNullOrWhiteSpace(request.ActionType))
        {
            var actionType = request.ActionType.Trim();
            query = query.Where(a => a.ActionType == actionType);
        }

        if (request.FromUtc.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= request.FromUtc.Value);
        }

        if (request.ToUtc.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= request.ToUtc.Value);
        }

        // Newest first by CreatedAt
        query = query.OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new ActivityLogDto(
                a.Id,
                a.ActorId,
                a.ActorEmail,
                a.ActorRole,
                a.ActionType,
                a.EntityType,
                a.EntityId,
                a.ProjectId,
                a.Project != null ? a.Project.Name : null,
                a.PayloadJson,
                a.IpAddress,
                a.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedList<ActivityLogDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
