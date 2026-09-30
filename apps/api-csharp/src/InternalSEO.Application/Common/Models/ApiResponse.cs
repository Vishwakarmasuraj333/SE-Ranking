namespace InternalSEO.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public T? Data { get; set; }
    public string? Message { get; set; }
    public ApiMeta? Meta { get; set; }

    public static ApiResponse<T> Succeeded(T data, string? message = null, ApiMeta? meta = null) =>
        new() { Success = true, Data = data, Message = message, Meta = meta };

    public static ApiResponse<T> Failed(string message, ApiMeta? meta = null) =>
        new() { Success = false, Message = message, Meta = meta };
}

public class ApiMeta
{
    public string? CorrelationId { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastSyncedAt { get; set; }
    public DateTimeOffset? LastCrawledAt { get; set; }
}
