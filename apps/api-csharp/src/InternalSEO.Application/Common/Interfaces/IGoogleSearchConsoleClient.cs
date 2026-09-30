using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Common.Interfaces;

public interface IGoogleSearchConsoleClient
{
    Task<IReadOnlyList<GscProperty>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default);
    Task<GscFetchDataResult> FetchPerformanceDataAsync(string accessToken, string propertyIdentifier, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
}
