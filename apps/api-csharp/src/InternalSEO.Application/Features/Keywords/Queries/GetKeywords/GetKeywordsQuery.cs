using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Queries.GetKeywords;

public record GetKeywordsQuery(
    Guid ProjectId,
    string? Search = null,
    Guid? GroupId = null,
    string? Tag = null,
    string? Device = null,
    string? Status = null,
    string? SearchIntent = null,
    string? Sort = null,
    int Page = 1,
    int PageSize = 25
) : IRequest<PaginatedList<KeywordDto>>;

public class GetKeywordsQueryHandler : IRequestHandler<GetKeywordsQuery, PaginatedList<KeywordDto>>
{
    private readonly IApplicationDbContext _context;

    public GetKeywordsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<KeywordDto>> Handle(GetKeywordsQuery request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (!projectExists)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        var query = _context.Keywords
            .Include(k => k.Group)
            .Include(k => k.KeywordTags)
            .ThenInclude(kt => kt.Tag)
            .Where(k => k.ProjectId == request.ProjectId)
            .AsNoTracking();

        // Search Filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(k => k.NormalizedText.Contains(search) ||
                                     (k.TargetUrl != null && k.TargetUrl.ToLower().Contains(search)));
        }

        // Group Filter
        if (request.GroupId.HasValue)
        {
            query = query.Where(k => k.GroupId == request.GroupId.Value);
        }

        // Tag Filter
        if (!string.IsNullOrWhiteSpace(request.Tag))
        {
            var tag = request.Tag.Trim().ToLowerInvariant();
            query = query.Where(k => k.KeywordTags.Any(kt => kt.Tag.Name.ToLower() == tag));
        }

        // Device Filter
        if (!string.IsNullOrWhiteSpace(request.Device) && request.Device.ToLower() != "all")
        {
            var device = request.Device.Trim().ToLowerInvariant();
            query = query.Where(k => k.Device == device);
        }

        // Status Filter
        if (!string.IsNullOrWhiteSpace(request.Status) && request.Status.ToLower() != "all")
        {
            if (request.Status.Equals("active", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(k => k.IsActive);
            }
            else if (request.Status.Equals("paused", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(k => !k.IsActive);
            }
        }

        // Search Intent Filter
        if (!string.IsNullOrWhiteSpace(request.SearchIntent) && request.SearchIntent.ToLower() != "all")
        {
            var intent = request.SearchIntent.Trim().ToLowerInvariant();
            query = query.Where(k => k.SearchIntent != null && k.SearchIntent.ToLower() == intent);
        }

        // Sorting
        query = request.Sort?.Trim().ToLowerInvariant() switch
        {
            "keyword" => query.OrderBy(k => k.KeywordText),
            "-keyword" => query.OrderByDescending(k => k.KeywordText),
            "volume" => query.OrderBy(k => k.MonthlySearchVolume),
            "-volume" => query.OrderByDescending(k => k.MonthlySearchVolume),
            "difficulty" => query.OrderBy(k => k.KeywordDifficulty),
            "-difficulty" => query.OrderByDescending(k => k.KeywordDifficulty),
            "created" => query.OrderBy(k => k.CreatedAt),
            "-created" => query.OrderByDescending(k => k.CreatedAt),
            _ => query.OrderByDescending(k => k.CreatedAt)
        };

        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 25 : Math.Min(request.PageSize, 100);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(k => new KeywordDto
            {
                Id = k.Id,
                ProjectId = k.ProjectId,
                GroupId = k.GroupId,
                GroupName = k.Group != null ? k.Group.Name : null,
                GroupColor = k.Group != null ? k.Group.ColorHex : null,
                KeywordText = k.KeywordText,
                SearchEngine = k.SearchEngine,
                CountryCode = k.CountryCode,
                LocationName = k.LocationName,
                LanguageCode = k.LanguageCode,
                Device = k.Device,
                TargetUrl = k.TargetUrl,
                SearchIntent = k.SearchIntent,
                MonthlySearchVolume = k.MonthlySearchVolume,
                KeywordDifficulty = k.KeywordDifficulty,
                CpcUsd = k.CpcUsd,
                IsActive = k.IsActive,
                LastCheckedAt = k.LastCheckedAt,
                CreatedAt = k.CreatedAt,
                Tags = k.KeywordTags.Select(kt => kt.Tag.Name).ToList()
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<KeywordDto>(items, totalCount, page, pageSize);
    }
}
