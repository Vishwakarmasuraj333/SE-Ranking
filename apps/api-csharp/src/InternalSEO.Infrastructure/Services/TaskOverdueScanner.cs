using InternalSEO.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class TaskOverdueScanner : ITaskOverdueScanner
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<TaskOverdueScanner> _logger;

    public TaskOverdueScanner(
        IApplicationDbContext context,
        INotificationService notificationService,
        ILogger<TaskOverdueScanner> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<int> ScanAndNotifyOverdueTasksAsync(CancellationToken cancellationToken = default)
    {
        var todayUtc = DateOnly.FromDateTime(DateTime.UtcNow);

        // Authoritative overdue condition:
        // DueDate < today's UTC date AND Status NOT IN ('Verified', 'Closed')
        var overdueTasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.DueDate.HasValue &&
                        t.DueDate.Value < todayUtc &&
                        t.Status != "Verified" &&
                        t.Status != "Closed")
            .Select(t => new
            {
                t.Id,
                t.ProjectId,
                t.Title,
                t.DueDate,
                t.AssigneeId
            })
            .ToListAsync(cancellationToken);

        if (overdueTasks.Count == 0)
        {
            _logger.LogInformation("TaskOverdueScanner: No overdue tasks found.");
            return 0;
        }

        _logger.LogInformation("TaskOverdueScanner: Found {Count} overdue task(s). Processing notifications...", overdueTasks.Count);

        int notificationsSent = 0;
        foreach (var task in overdueTasks)
        {
            var targetUrl = $"/projects/{task.ProjectId}/tasks/{task.Id}";
            var message = $"Task '{task.Title}' was due on {task.DueDate:yyyy-MM-dd} and is currently overdue.";

            if (task.AssigneeId.HasValue)
            {
                // Direct notification to assignee (subject to 24h deduplication)
                var sent = await _notificationService.CreateDirectNotificationAsync(
                    projectId: task.ProjectId,
                    userId: task.AssigneeId.Value,
                    title: "Task Overdue",
                    message: message,
                    severity: "Warning",
                    eventType: "TaskOverdue",
                    targetUrl: targetUrl,
                    cancellationToken: cancellationToken);

                if (sent) notificationsSent++;
            }
            else
            {
                // Unassigned overdue task: project broadcast to project members (subject to 24h deduplication)
                var count = await _notificationService.CreateProjectBroadcastAsync(
                    projectId: task.ProjectId,
                    title: "Task Overdue",
                    message: message,
                    severity: "Warning",
                    eventType: "TaskOverdue",
                    targetUrl: targetUrl,
                    cancellationToken: cancellationToken);

                if (count > 0) notificationsSent++;
            }
        }

        _logger.LogInformation("TaskOverdueScanner: Completed scan. {Count} notification event(s) emitted.", notificationsSent);
        return notificationsSent;
    }
}
