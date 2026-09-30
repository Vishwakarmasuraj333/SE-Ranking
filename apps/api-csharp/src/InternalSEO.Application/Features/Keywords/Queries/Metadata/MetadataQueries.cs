using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Queries.Metadata;

// Get Keyword Groups
public record GetKeywordGroupsQuery(Guid ProjectId) : IRequest<List<KeywordGroupDto>>;

public class GetKeywordGroupsQueryHandler : IRequestHandler<GetKeywordGroupsQuery, List<KeywordGroupDto>>
{
    private readonly IApplicationDbContext _context;

    public GetKeywordGroupsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<KeywordGroupDto>> Handle(GetKeywordGroupsQuery request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (!projectExists)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        return await _context.KeywordGroups
            .Where(g => g.ProjectId == request.ProjectId)
            .OrderBy(g => g.Name)
            .Select(g => new KeywordGroupDto
            {
                Id = g.Id,
                ProjectId = g.ProjectId,
                Name = g.Name,
                ColorHex = g.ColorHex,
                KeywordCount = g.Keywords.Count,
                CreatedAt = g.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

// Get Tags
public record GetTagsQuery(Guid ProjectId) : IRequest<List<TagDto>>;

public class GetTagsQueryHandler : IRequestHandler<GetTagsQuery, List<TagDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTagsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TagDto>> Handle(GetTagsQuery request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (!projectExists)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        return await _context.Tags
            .Where(t => t.ProjectId == request.ProjectId)
            .OrderBy(t => t.Name)
            .Select(t => new TagDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Name = t.Name,
                KeywordCount = t.KeywordTags.Count,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
