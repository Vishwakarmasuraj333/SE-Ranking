using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Queries.GetKeywordById;

public record GetKeywordByIdQuery(Guid ProjectId, Guid Id) : IRequest<KeywordDto>;

public class GetKeywordByIdQueryHandler : IRequestHandler<GetKeywordByIdQuery, KeywordDto>
{
    private readonly IApplicationDbContext _context;

    public GetKeywordByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<KeywordDto> Handle(GetKeywordByIdQuery request, CancellationToken cancellationToken)
    {
        var keyword = await _context.Keywords
            .Include(k => k.Group)
            .Include(k => k.KeywordTags)
            .ThenInclude(kt => kt.Tag)
            .Where(k => k.Id == request.Id && k.ProjectId == request.ProjectId)
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (keyword == null)
        {
            throw new NotFoundException(nameof(Keyword), request.Id);
        }

        return new KeywordDto
        {
            Id = keyword.Id,
            ProjectId = keyword.ProjectId,
            GroupId = keyword.GroupId,
            GroupName = keyword.Group?.Name,
            GroupColor = keyword.Group?.ColorHex,
            KeywordText = keyword.KeywordText,
            SearchEngine = keyword.SearchEngine,
            CountryCode = keyword.CountryCode,
            LocationName = keyword.LocationName,
            LanguageCode = keyword.LanguageCode,
            Device = keyword.Device,
            TargetUrl = keyword.TargetUrl,
            SearchIntent = keyword.SearchIntent,
            MonthlySearchVolume = keyword.MonthlySearchVolume,
            KeywordDifficulty = keyword.KeywordDifficulty,
            CpcUsd = keyword.CpcUsd,
            IsActive = keyword.IsActive,
            LastCheckedAt = keyword.LastCheckedAt,
            CreatedAt = keyword.CreatedAt,
            Tags = keyword.KeywordTags.Select(kt => kt.Tag.Name).ToList()
        };
    }
}
