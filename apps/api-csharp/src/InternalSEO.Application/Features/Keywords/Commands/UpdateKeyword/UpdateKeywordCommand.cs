using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.UpdateKeyword;

public record UpdateKeywordCommand : IRequest<KeywordDto>
{
    public Guid ProjectId { get; init; }
    public Guid Id { get; init; }
    public string? TargetUrl { get; init; }
    public string? SearchIntent { get; init; }
    public Guid? GroupId { get; init; }
    public List<string>? Tags { get; init; }
    public bool IsActive { get; init; } = true;
}

public class UpdateKeywordCommandValidator : AbstractValidator<UpdateKeywordCommand>
{
    private static readonly string[] AllowedIntents = { "Informational", "Navigational", "Commercial", "Transactional" };

    public UpdateKeywordCommandValidator()
    {
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Keyword ID is required.");

        RuleFor(v => v.TargetUrl)
            .Must(BeValidUrl).When(v => !string.IsNullOrWhiteSpace(v.TargetUrl))
            .WithMessage("Target URL must be a valid HTTP or HTTPS absolute URL.");

        RuleFor(v => v.SearchIntent)
            .Must(i => string.IsNullOrWhiteSpace(i) || AllowedIntents.Contains(i.Trim(), StringComparer.OrdinalIgnoreCase))
            .WithMessage("Search intent must be one of: Informational, Navigational, Commercial, Transactional.");
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}

public class UpdateKeywordCommandHandler : IRequestHandler<UpdateKeywordCommand, KeywordDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public UpdateKeywordCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<KeywordDto> Handle(UpdateKeywordCommand request, CancellationToken cancellationToken)
    {
        var keyword = await _context.Keywords
            .Include(k => k.KeywordTags)
            .ThenInclude(kt => kt.Tag)
            .Include(k => k.Group)
            .FirstOrDefaultAsync(k => k.Id == request.Id && k.ProjectId == request.ProjectId, cancellationToken);

        if (keyword == null)
        {
            throw new NotFoundException(nameof(Keyword), request.Id);
        }

        if (request.GroupId.HasValue)
        {
            var groupExists = await _context.KeywordGroups.AnyAsync(
                g => g.Id == request.GroupId.Value && g.ProjectId == request.ProjectId, cancellationToken);
            if (!groupExists)
            {
                throw new NotFoundException(nameof(KeywordGroup), request.GroupId.Value);
            }
        }

        keyword.TargetUrl = string.IsNullOrWhiteSpace(request.TargetUrl) ? null : request.TargetUrl.Trim();
        keyword.SearchIntent = string.IsNullOrWhiteSpace(request.SearchIntent) ? null : request.SearchIntent.Trim();
        keyword.GroupId = request.GroupId;
        keyword.IsActive = request.IsActive;

        // Update tags if provided
        List<string> currentTags;
        if (request.Tags != null)
        {
            var requestedTagNames = request.Tags
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Clear old tags
            keyword.KeywordTags.Clear();

            if (requestedTagNames.Any())
            {
                var existingTags = await _context.Tags
                    .Where(t => t.ProjectId == request.ProjectId && requestedTagNames.Contains(t.Name))
                    .ToListAsync(cancellationToken);

                foreach (var name in requestedTagNames)
                {
                    var tag = existingTags.FirstOrDefault(t => t.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
                    if (tag == null)
                    {
                        tag = new Tag
                        {
                            Id = Guid.NewGuid(),
                            ProjectId = request.ProjectId,
                            Name = name,
                            CreatedAt = DateTimeOffset.UtcNow
                        };
                        _context.Tags.Add(tag);
                        existingTags.Add(tag);
                    }

                    keyword.KeywordTags.Add(new KeywordTag
                    {
                        KeywordId = keyword.Id,
                        TagId = tag.Id
                    });
                }
            }

            currentTags = requestedTagNames;
        }
        else
        {
            currentTags = keyword.KeywordTags.Select(kt => kt.Tag.Name).ToList();
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.Updated",
            entityType: "Keyword",
            entityId: keyword.Id.ToString(),
            projectId: keyword.ProjectId,
            payload: new { keyword.KeywordText, keyword.TargetUrl, keyword.SearchIntent, keyword.IsActive },
            cancellationToken: cancellationToken);

        string? groupName = null;
        string? groupColor = null;
        if (keyword.GroupId.HasValue)
        {
            var grp = await _context.KeywordGroups.FindAsync(new object[] { keyword.GroupId.Value }, cancellationToken);
            groupName = grp?.Name;
            groupColor = grp?.ColorHex;
        }

        return new KeywordDto
        {
            Id = keyword.Id,
            ProjectId = keyword.ProjectId,
            GroupId = keyword.GroupId,
            GroupName = groupName,
            GroupColor = groupColor,
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
            Tags = currentTags
        };
    }
}
