using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Reports.Commands;

public record DeleteReportCommand(Guid ProjectId, Guid ReportId) : IRequest<ApiResponse<bool>>;

public class DeleteReportCommandHandler : IRequestHandler<DeleteReportCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DeleteReportCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteReportCommand request, CancellationToken cancellationToken)
    {
        var report = await _context.ReportRuns
            .FirstOrDefaultAsync(r => r.Id == request.ReportId && r.ProjectId == request.ProjectId, cancellationToken);

        if (report == null)
        {
            throw new NotFoundException($"Report with ID {request.ReportId} was not found in project {request.ProjectId}.");
        }

        _context.ReportRuns.Remove(report);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            "Deleted",
            "ReportRun",
            request.ReportId.ToString(),
            request.ProjectId,
            $"Deleted executive report snapshot '{report.Title}'",
            cancellationToken);

        return ApiResponse<bool>.Succeeded(true, "Report deleted successfully.");
    }
}
