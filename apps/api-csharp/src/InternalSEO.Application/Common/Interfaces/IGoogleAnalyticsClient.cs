using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Common.Interfaces;

public interface IGoogleAnalyticsClient
{
    Task<IReadOnlyList<Ga4Property>> GetAccessiblePropertiesAsync(string accessToken, CancellationToken cancellationToken = default);
    Task<Ga4FetchDataResult> FetchPerformanceDataAsync(string accessToken, string propertyIdentifier, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
}
