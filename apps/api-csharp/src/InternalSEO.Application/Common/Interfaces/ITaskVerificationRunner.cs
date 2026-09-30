namespace InternalSEO.Application.Common.Interfaces;

public interface ITaskVerificationRunner
{
    Task ExecuteVerificationAsync(long taskVerificationId, CancellationToken cancellationToken);
}
