using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.BulkCreateKeywords;

public record BulkCreateKeywordsCommand : IRequest<ImportKeywordsResultDto>
{
    public Guid ProjectId { get; init; }
    public List<ImportKeywordRow> Rows { get; init; } = new();
}

public class BulkCreateKeywordsCommandHandler : IRequestHandler<BulkCreateKeywordsCommand, ImportKeywordsResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;
    private const int MaxBatchSize = 2000;

    public BulkCreateKeywordsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<ImportKeywordsResultDto> Handle(BulkCreateKeywordsCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        if (request.Rows.Count > MaxBatchSize)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.Rows), $"Batch upload cannot exceed {MaxBatchSize} keywords at a time. Received {request.Rows.Count}.")
            });
        }

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        // Load existing keywords for project to check duplicates in memory
        var existingKeywords = await _context.Keywords
            .Where(k => k.ProjectId == request.ProjectId)
            .Select(k => new
            {
                k.NormalizedText,
                k.SearchEngine,
                k.CountryCode,
                k.Device,
                LocationName = k.LocationName ?? string.Empty
            })
            .ToListAsync(cancellationToken);

        var existingKeys = new HashSet<string>(
            existingKeywords.Select(k => $"{k.NormalizedText}|{k.SearchEngine}|{k.CountryCode}|{k.Device}|{k.LocationName}"),
            StringComparer.OrdinalIgnoreCase);

        // Load existing groups and tags
        var existingGroups = await _context.KeywordGroups
            .Where(g => g.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        var existingTags = await _context.Tags
            .Where(t => t.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        var newKeywords = new List<Keyword>();
        var errors = new List<string>();
        int skippedDuplicates = 0;
        int failedCount = 0;

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            int rowNum = i + 1;

            if (string.IsNullOrWhiteSpace(row.Keyword))
            {
                errors.Add($"Row {rowNum}: Keyword text is empty.");
                failedCount++;
                continue;
            }

            var keywordText = row.Keyword.Trim();
            if (keywordText.Length > 300)
            {
                errors.Add($"Row {rowNum}: Keyword exceeds 300 characters ('{keywordText.Substring(0, 30)}...').");
                failedCount++;
                continue;
            }

            var normalizedText = keywordText.ToLowerInvariant();
            var engine = string.IsNullOrWhiteSpace(row.SearchEngine) ? "google" : row.SearchEngine.Trim().ToLowerInvariant();
            var country = string.IsNullOrWhiteSpace(row.Country) ? "US" : row.Country.Trim().ToUpperInvariant();
            var device = string.IsNullOrWhiteSpace(row.Device) ? "desktop" : row.Device.Trim().ToLowerInvariant();
            if (device != "desktop" && device != "mobile") device = "desktop";
            var location = string.IsNullOrWhiteSpace(row.Location) ? null : row.Location.Trim();
            var locationKey = location ?? string.Empty;

            var key = $"{normalizedText}|{engine}|{country}|{device}|{locationKey}";
            if (existingKeys.Contains(key))
            {
                skippedDuplicates++;
                continue;
            }
            existingKeys.Add(key);

            // Target URL check
            string? targetUrl = null;
            if (!string.IsNullOrWhiteSpace(row.TargetUrl))
            {
                var trimmedUrl = row.TargetUrl.Trim();
                if (Uri.TryCreate(trimmedUrl, UriKind.Absolute, out var uri) &&
                    (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                {
                    targetUrl = trimmedUrl;
                }
                else
                {
                    errors.Add($"Row {rowNum}: Invalid target URL '{trimmedUrl}'. Must be a valid absolute HTTP or HTTPS URL.");
                    failedCount++;
                    continue;
                }
            }

            // Group mapping or creation
            Guid? groupId = null;
            if (!string.IsNullOrWhiteSpace(row.Group))
            {
                var groupName = row.Group.Trim();
                var group = existingGroups.FirstOrDefault(g => g.Name.Equals(groupName, StringComparison.OrdinalIgnoreCase));
                if (group == null)
                {
                    group = new KeywordGroup
                    {
                        Id = Guid.NewGuid(),
                        ProjectId = request.ProjectId,
                        Name = groupName,
                        ColorHex = "#3B82F6",
                        CreatedAt = DateTimeOffset.UtcNow
                    };
                    _context.KeywordGroups.Add(group);
                    existingGroups.Add(group);
                }
                groupId = group.Id;
            }

            // Keyword entity
            var keyword = new Keyword
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                GroupId = groupId,
                KeywordText = keywordText,
                NormalizedText = normalizedText,
                SearchEngine = engine,
                CountryCode = country.Length == 2 ? country : "US",
                LocationName = location,
                LanguageCode = string.IsNullOrWhiteSpace(row.Language) ? "en" : row.Language.Trim().ToLowerInvariant(),
                Device = device,
                TargetUrl = targetUrl,
                SearchIntent = string.IsNullOrWhiteSpace(row.Intent) ? null : row.Intent.Trim(),
                MonthlySearchVolume = row.Volume,
                KeywordDifficulty = row.Difficulty,
                CpcUsd = row.Cpc,
                IsActive = true,
                CreatedBy = userId,
                CreatedAt = DateTimeOffset.UtcNow
            };

            // Tags mapping or creation
            if (!string.IsNullOrWhiteSpace(row.Tags))
            {
                var tagParts = row.Tags
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Distinct(StringComparer.OrdinalIgnoreCase);

                foreach (var tagName in tagParts)
                {
                    var tag = existingTags.FirstOrDefault(t => t.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase));
                    if (tag == null)
                    {
                        tag = new Tag
                        {
                            Id = Guid.NewGuid(),
                            ProjectId = request.ProjectId,
                            Name = tagName,
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

            newKeywords.Add(keyword);
        }

        if (newKeywords.Any())
        {
            _context.Keywords.AddRange(newKeywords);
            await _context.SaveChangesAsync(cancellationToken);

            await _activityLogger.LogAsync(
                actionType: "Keyword.BulkImported",
                entityType: "Keyword",
                entityId: request.ProjectId.ToString(),
                projectId: request.ProjectId,
                payload: new { ImportedCount = newKeywords.Count, SkippedDuplicates = skippedDuplicates, ErrorsCount = failedCount },
                cancellationToken: cancellationToken);
        }

        return new ImportKeywordsResultDto
        {
            TotalProcessed = request.Rows.Count,
            ImportedCount = newKeywords.Count,
            SkippedDuplicatesCount = skippedDuplicates,
            FailedCount = failedCount,
            Errors = errors
        };
    }
}
