using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.CreateKeyword;

public record CreateKeywordCommand : IRequest<KeywordDto>
{
    public Guid ProjectId { get; init; }
    public string KeywordText { get; init; } = string.Empty;
    public string SearchEngine { get; init; } = "google";
    public string CountryCode { get; init; } = "US";
    public string? LocationName { get; init; }
    public string LanguageCode { get; init; } = "en";
    public string Device { get; init; } = "desktop";
    public string? TargetUrl { get; init; }
    public string? SearchIntent { get; init; }
    public Guid? GroupId { get; init; }
    public List<string> Tags { get; init; } = new();
    public int? MonthlySearchVolume { get; init; }
    public decimal? KeywordDifficulty { get; init; }
    public decimal? CpcUsd { get; init; }
}

public class CreateKeywordCommandValidator : AbstractValidator<CreateKeywordCommand>
{
    private static readonly string[] AllowedIntents = { "Informational", "Navigational", "Commercial", "Transactional" };
    private static readonly string[] AllowedDevices = { "desktop", "mobile" };

    public CreateKeywordCommandValidator()
    {
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

        RuleFor(v => v.KeywordText)
            .NotEmpty().WithMessage("Keyword text is required.")
            .MaximumLength(300).WithMessage("Keyword text cannot exceed 300 characters.");

        RuleFor(v => v.CountryCode)
            .NotEmpty().WithMessage("Country code is required.")
            .Length(2).WithMessage("Country code must be 2 characters (e.g. US).");

        RuleFor(v => v.Device)
            .NotEmpty().WithMessage("Device is required.")
            .Must(d => AllowedDevices.Contains(d.Trim().ToLowerInvariant()))
            .WithMessage("Device must be 'desktop' or 'mobile'.");

        RuleFor(v => v.SearchEngine)
            .NotEmpty().WithMessage("Search engine is required.")
            .MaximumLength(50).WithMessage("Search engine cannot exceed 50 characters.");

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

public class CreateKeywordCommandHandler : IRequestHandler<CreateKeywordCommand, KeywordDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;

    public CreateKeywordCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<KeywordDto> Handle(CreateKeywordCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var normalizedText = request.KeywordText.Trim().ToLowerInvariant();
        var normalizedEngine = request.SearchEngine.Trim().ToLowerInvariant();
        var normalizedCountry = request.CountryCode.Trim().ToUpperInvariant();
        var normalizedDevice = request.Device.Trim().ToLowerInvariant();
        var normalizedLocation = string.IsNullOrWhiteSpace(request.LocationName) ? null : request.LocationName.Trim();

        // Unique constraint check
        var exists = await _context.Keywords.AnyAsync(k =>
            k.ProjectId == request.ProjectId &&
            k.NormalizedText == normalizedText &&
            k.SearchEngine == normalizedEngine &&
            k.CountryCode == normalizedCountry &&
            k.Device == normalizedDevice &&
            k.LocationName == normalizedLocation,
            cancellationToken);

        if (exists)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.KeywordText),
                    $"The keyword '{request.KeywordText.Trim()}' is already tracked for {normalizedEngine} ({normalizedDevice}, {normalizedCountry}).")
            });
        }

        // Validate GroupId belongs to project if specified
        if (request.GroupId.HasValue)
        {
            var groupExists = await _context.KeywordGroups.AnyAsync(
                g => g.Id == request.GroupId.Value && g.ProjectId == request.ProjectId, cancellationToken);
            if (!groupExists)
            {
                throw new NotFoundException(nameof(KeywordGroup), request.GroupId.Value);
            }
        }

        var keyword = new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            GroupId = request.GroupId,
            KeywordText = request.KeywordText.Trim(),
            NormalizedText = normalizedText,
            SearchEngine = normalizedEngine,
            CountryCode = normalizedCountry,
            LocationName = normalizedLocation,
            LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? "en" : request.LanguageCode.Trim().ToLowerInvariant(),
            Device = normalizedDevice,
            TargetUrl = string.IsNullOrWhiteSpace(request.TargetUrl) ? null : request.TargetUrl.Trim(),
            SearchIntent = string.IsNullOrWhiteSpace(request.SearchIntent) ? null : request.SearchIntent.Trim(),
            MonthlySearchVolume = request.MonthlySearchVolume,
            KeywordDifficulty = request.KeywordDifficulty,
            CpcUsd = request.CpcUsd,
            IsActive = true,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Attach or create tags
        var tagNames = request.Tags?
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? new List<string>();

        if (tagNames.Any())
        {
            var existingTags = await _context.Tags
                .Where(t => t.ProjectId == request.ProjectId && tagNames.Contains(t.Name))
                .ToListAsync(cancellationToken);

            foreach (var name in tagNames)
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

        _context.Keywords.Add(keyword);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.Created",
            entityType: "Keyword",
            entityId: keyword.Id.ToString(),
            projectId: keyword.ProjectId,
            payload: new { keyword.KeywordText, keyword.Device, keyword.SearchEngine, keyword.CountryCode },
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
            Tags = tagNames
        };
    }
}
