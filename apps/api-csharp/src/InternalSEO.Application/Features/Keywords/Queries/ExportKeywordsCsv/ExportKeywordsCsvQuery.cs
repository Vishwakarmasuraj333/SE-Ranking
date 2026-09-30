using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Queries.ExportKeywordsCsv;

public record ExportKeywordsCsvQuery(
    Guid ProjectId,
    string? Search = null,
    Guid? GroupId = null,
    string? Device = null,
    string? Status = null
) : IRequest<byte[]>;

public class ExportKeywordsCsvQueryHandler : IRequestHandler<ExportKeywordsCsvQuery, byte[]>
{
    private readonly IApplicationDbContext _context;

    public ExportKeywordsCsvQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> Handle(ExportKeywordsCsvQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        var query = _context.Keywords
            .Include(k => k.Group)
            .Include(k => k.KeywordTags)
            .ThenInclude(kt => kt.Tag)
            .Where(k => k.ProjectId == request.ProjectId)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(k => k.NormalizedText.Contains(search));
        }

        if (request.GroupId.HasValue)
        {
            query = query.Where(k => k.GroupId == request.GroupId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Device) && request.Device.ToLower() != "all")
        {
            query = query.Where(k => k.Device == request.Device.Trim().ToLowerInvariant());
        }

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

        var keywords = await query
            .OrderBy(k => k.KeywordText)
            .ToListAsync(cancellationToken);

        using var memoryStream = new MemoryStream();
        using (var streamWriter = new StreamWriter(memoryStream, Encoding.UTF8))
        using (var csvWriter = new CsvWriter(streamWriter, new CsvConfiguration(CultureInfo.InvariantCulture)))
        {
            // Write Headers
            csvWriter.WriteField("Keyword");
            csvWriter.WriteField("Search Engine");
            csvWriter.WriteField("Country");
            csvWriter.WriteField("Device");
            csvWriter.WriteField("Location");
            csvWriter.WriteField("Search Intent");
            csvWriter.WriteField("Target URL");
            csvWriter.WriteField("Group");
            csvWriter.WriteField("Tags");
            csvWriter.WriteField("Volume");
            csvWriter.WriteField("Difficulty");
            csvWriter.WriteField("CPC");
            csvWriter.WriteField("Status");
            csvWriter.WriteField("Created At");
            csvWriter.NextRecord();

            // Write Rows
            foreach (var kw in keywords)
            {
                csvWriter.WriteField(kw.KeywordText);
                csvWriter.WriteField(kw.SearchEngine);
                csvWriter.WriteField(kw.CountryCode);
                csvWriter.WriteField(kw.Device);
                csvWriter.WriteField(kw.LocationName ?? string.Empty);
                csvWriter.WriteField(kw.SearchIntent ?? string.Empty);
                csvWriter.WriteField(kw.TargetUrl ?? string.Empty);
                csvWriter.WriteField(kw.Group?.Name ?? string.Empty);
                csvWriter.WriteField(string.Join(";", kw.KeywordTags.Select(kt => kt.Tag.Name)));
                csvWriter.WriteField(kw.MonthlySearchVolume?.ToString() ?? string.Empty);
                csvWriter.WriteField(kw.KeywordDifficulty?.ToString("F1") ?? string.Empty);
                csvWriter.WriteField(kw.CpcUsd?.ToString("F2") ?? string.Empty);
                csvWriter.WriteField(kw.IsActive ? "Active" : "Paused");
                csvWriter.WriteField(kw.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss 'UTC'"));
                csvWriter.NextRecord();
            }

            streamWriter.Flush();
        }

        return memoryStream.ToArray();
    }
}
