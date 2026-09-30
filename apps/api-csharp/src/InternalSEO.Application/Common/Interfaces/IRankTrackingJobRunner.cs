namespace InternalSEO.Application.Common.Interfaces;

public interface IRankTrackingJobRunner
{
    Task<int> ExecuteRankTrackingAsync(Guid projectId, CancellationToken cancellationToken = default);
}
