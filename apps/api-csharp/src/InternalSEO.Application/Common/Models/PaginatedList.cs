using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Common.Models;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; init; } = Array.Empty<T>();
    public int PageNumber { get; init; }
    public int TotalPages { get; init; }
    public int TotalCount { get; init; }
    public int PageSize { get; init; }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedList() { }

    [JsonConstructor]
    public PaginatedList(IReadOnlyCollection<T> items, int totalCount, int pageNumber, int pageSize, int totalPages = 0)
    {
        PageNumber = pageNumber;
        TotalPages = totalPages > 0 ? totalPages : (pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0);
        TotalCount = totalCount;
        PageSize = pageSize;
        Items = items ?? Array.Empty<T>();
    }

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var count = await source.CountAsync(cancellationToken);
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}
