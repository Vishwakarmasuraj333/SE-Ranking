namespace InternalSEO.Application.Common.Interfaces;

public interface ITaskOverdueScanner
{
    Task<int> ScanAndNotifyOverdueTasksAsync(CancellationToken cancellationToken = default);
}
