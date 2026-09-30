using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Keywords.Commands.BulkCreateKeywords;
using InternalSEO.Application.Features.Keywords.Commands.BulkOperations;
using InternalSEO.Application.Features.Keywords.Commands.CreateKeyword;
using InternalSEO.Application.Features.Keywords.Commands.DeleteKeyword;
using InternalSEO.Application.Features.Keywords.Commands.UpdateKeyword;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Application.Features.Keywords.Queries.ExportKeywordsCsv;
using InternalSEO.Application.Features.Keywords.Queries.GetKeywordById;
using InternalSEO.Application.Features.Keywords.Queries.GetKeywords;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

[Authorize]
[Route("api/v1/projects/{projectId:guid}/keywords")]
public class KeywordsController : BaseApiController
{
    [HttpGet]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<PaginatedList<KeywordDto>>>> GetKeywords(
        Guid projectId,
        [FromQuery] string? search,
        [FromQuery] Guid? groupId,
        [FromQuery] string? tag,
        [FromQuery] string? device,
        [FromQuery] string? status,
        [FromQuery] string? searchIntent,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var result = await Mediator.Send(new GetKeywordsQuery(
            projectId, search, groupId, tag, device, status, searchIntent, sort, page, pageSize));
        return Success(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<ActionResult<ApiResponse<KeywordDto>>> GetKeywordById(Guid projectId, Guid id)
    {
        var result = await Mediator.Send(new GetKeywordByIdQuery(projectId, id));
        return Success(result);
    }

    [HttpPost]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<KeywordDto>>> CreateKeyword(Guid projectId, [FromBody] CreateKeywordRequest request)
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = projectId,
            KeywordText = request.KeywordText,
            SearchEngine = request.SearchEngine ?? "google",
            CountryCode = request.CountryCode ?? "US",
            LocationName = request.LocationName,
            LanguageCode = request.LanguageCode ?? "en",
            Device = request.Device ?? "desktop",
            TargetUrl = request.TargetUrl,
            SearchIntent = request.SearchIntent,
            GroupId = request.GroupId,
            Tags = request.Tags ?? new(),
            MonthlySearchVolume = request.MonthlySearchVolume,
            KeywordDifficulty = request.KeywordDifficulty,
            CpcUsd = request.CpcUsd
        };

        var result = await Mediator.Send(command);
        return CreatedSuccess($"/api/v1/projects/{projectId}/keywords/{result.Id}", result, "Keyword added successfully.");
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<KeywordDto>>> UpdateKeyword(
        Guid projectId,
        Guid id,
        [FromBody] UpdateKeywordRequest request)
    {
        var command = new UpdateKeywordCommand
        {
            ProjectId = projectId,
            Id = id,
            TargetUrl = request.TargetUrl,
            SearchIntent = request.SearchIntent,
            GroupId = request.GroupId,
            Tags = request.Tags,
            IsActive = request.IsActive
        };

        var result = await Mediator.Send(command);
        return Success(result, "Keyword updated successfully.");
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteKeyword(Guid projectId, Guid id)
    {
        var result = await Mediator.Send(new DeleteKeywordCommand(projectId, id));
        return Success(result, "Keyword removed successfully.");
    }

    [HttpPost("bulk")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ImportKeywordsResultDto>>> BulkCreateKeywords(
        Guid projectId,
        [FromBody] BulkCreateKeywordsRequest request)
    {
        var command = new BulkCreateKeywordsCommand
        {
            ProjectId = projectId,
            Rows = request.Rows
        };

        var result = await Mediator.Send(command);
        return Success(result, $"Processed {result.TotalProcessed} keywords: {result.ImportedCount} imported, {result.SkippedDuplicatesCount} duplicates skipped.");
    }

    [HttpPost("bulk-status")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<int>>> BulkUpdateStatus(
        Guid projectId,
        [FromBody] BulkStatusRequest request)
    {
        var result = await Mediator.Send(new BulkUpdateKeywordStatusCommand(projectId, request.KeywordIds, request.IsActive));
        return Success(result, $"{result} keywords updated.");
    }

    [HttpPost("bulk-group")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<int>>> BulkAssignGroup(
        Guid projectId,
        [FromBody] BulkGroupRequest request)
    {
        var result = await Mediator.Send(new BulkAssignGroupCommand(projectId, request.KeywordIds, request.GroupId));
        return Success(result, $"{result} keywords assigned to group.");
    }

    [HttpPost("bulk-delete")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<int>>> BulkDeleteKeywords(
        Guid projectId,
        [FromBody] BulkDeleteRequest request)
    {
        var result = await Mediator.Send(new BulkDeleteKeywordsCommand(projectId, request.KeywordIds));
        return Success(result, $"{result} keywords deleted.");
    }

    [HttpPost("import-csv")]
    [Authorize(Policy = "RequireProjectWriter")]
    public async Task<ActionResult<ApiResponse<ImportKeywordsResultDto>>> ImportCsv(
        Guid projectId,
        IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiResponse<ImportKeywordsResultDto>
            {
                Success = false,
                Message = "A valid CSV file must be provided."
            });
        }

        var rows = new List<ImportKeywordRow>();

        using (var reader = new StreamReader(file.OpenReadStream()))
        using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header.ToLower().Replace(" ", "").Replace("_", ""),
            MissingFieldFound = null,
            HeaderValidated = null
        }))
        {
            while (await csv.ReadAsync())
            {
                var row = new ImportKeywordRow();

                if (csv.TryGetField<string>("keyword", out var kw) || csv.TryGetField<string>("keywordtext", out kw))
                {
                    row.Keyword = kw ?? string.Empty;
                }

                if (csv.TryGetField<string>("searchengine", out var se)) row.SearchEngine = se;
                if (csv.TryGetField<string>("country", out var c) || csv.TryGetField<string>("countrycode", out c)) row.Country = c;
                if (csv.TryGetField<string>("device", out var d)) row.Device = d;
                if (csv.TryGetField<string>("location", out var loc) || csv.TryGetField<string>("locationname", out loc)) row.Location = loc;
                if (csv.TryGetField<string>("language", out var lang) || csv.TryGetField<string>("languagecode", out lang)) row.Language = lang;
                if (csv.TryGetField<string>("searchintent", out var intent) || csv.TryGetField<string>("intent", out intent)) row.Intent = intent;
                if (csv.TryGetField<string>("targeturl", out var url) || csv.TryGetField<string>("url", out url)) row.TargetUrl = url;
                if (csv.TryGetField<string>("group", out var grp) || csv.TryGetField<string>("groupname", out grp)) row.Group = grp;
                if (csv.TryGetField<string>("tags", out var t)) row.Tags = t;
                if (csv.TryGetField<int>("volume", out var vol) || csv.TryGetField<int>("monthlysearchvolume", out vol)) row.Volume = vol;
                if (csv.TryGetField<decimal>("difficulty", out var diff) || csv.TryGetField<decimal>("keyworddifficulty", out diff)) row.Difficulty = diff;
                if (csv.TryGetField<decimal>("cpc", out var cpc) || csv.TryGetField<decimal>("cpcusd", out cpc)) row.Cpc = cpc;

                if (!string.IsNullOrWhiteSpace(row.Keyword))
                {
                    rows.Add(row);
                }
            }
        }

        var result = await Mediator.Send(new BulkCreateKeywordsCommand
        {
            ProjectId = projectId,
            Rows = rows
        });

        return Success(result, $"CSV Import completed: {result.ImportedCount} imported, {result.SkippedDuplicatesCount} duplicates skipped.");
    }

    [HttpGet("export-csv")]
    [Authorize(Policy = "RequireProjectMember")]
    public async Task<IActionResult> ExportCsv(
        Guid projectId,
        [FromQuery] string? search,
        [FromQuery] Guid? groupId,
        [FromQuery] string? device,
        [FromQuery] string? status)
    {
        var csvBytes = await Mediator.Send(new ExportKeywordsCsvQuery(projectId, search, groupId, device, status));
        var filename = $"keywords_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(csvBytes, "text/csv", filename);
    }
}

public class CreateKeywordRequest
{
    public string KeywordText { get; set; } = string.Empty;
    public string? SearchEngine { get; set; } = "google";
    public string? CountryCode { get; set; } = "US";
    public string? LocationName { get; set; }
    public string? LanguageCode { get; set; } = "en";
    public string? Device { get; set; } = "desktop";
    public string? TargetUrl { get; set; }
    public string? SearchIntent { get; set; }
    public Guid? GroupId { get; set; }
    public List<string>? Tags { get; set; }
    public int? MonthlySearchVolume { get; set; }
    public decimal? KeywordDifficulty { get; set; }
    public decimal? CpcUsd { get; set; }
}

public class UpdateKeywordRequest
{
    public string? TargetUrl { get; set; }
    public string? SearchIntent { get; set; }
    public Guid? GroupId { get; set; }
    public List<string>? Tags { get; set; }
    public bool IsActive { get; set; } = true;
}

public class BulkCreateKeywordsRequest
{
    public List<ImportKeywordRow> Rows { get; set; } = new();
}

public class BulkStatusRequest
{
    public List<Guid> KeywordIds { get; set; } = new();
    public bool IsActive { get; set; }
}

public class BulkGroupRequest
{
    public List<Guid> KeywordIds { get; set; } = new();
    public Guid? GroupId { get; set; }
}

public class BulkDeleteRequest
{
    public List<Guid> KeywordIds { get; set; } = new();
}
