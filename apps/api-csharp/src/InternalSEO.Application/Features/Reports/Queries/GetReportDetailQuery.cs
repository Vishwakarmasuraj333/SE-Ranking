using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Reports.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Reports.Queries;

public record GetReportDetailQuery(Guid ProjectId, Guid ReportId) : IRequest<ApiResponse<ReportDetailDto>>;

public class GetReportDetailQueryHandler : IRequestHandler<GetReportDetailQuery, ApiResponse<ReportDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReportDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<ReportDetailDto>> Handle(GetReportDetailQuery request, CancellationToken cancellationToken)
    {
        var report = await _context.ReportRuns
            .AsNoTracking()
            .Include(r => r.CreatedByUser)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId && r.ProjectId == request.ProjectId, cancellationToken);

        if (report == null)
        {
            throw new NotFoundException($"Report with ID {request.ReportId} was not found in project {request.ProjectId}.");
        }

        var dto = new ReportDetailDto
        {
            Id = report.Id,
            ProjectId = report.ProjectId,
            Title = report.Title,
            ExecutiveSummary = report.ExecutiveSummary,
            StartDate = report.StartDate,
            EndDate = report.EndDate,
            Sections = report.Sections,
            SnapshotJson = report.SnapshotJson,
            CreatedByUserId = report.CreatedByUserId,
            CreatedByUserName = report.CreatedByUser.FullName ?? report.CreatedByUser.Email ?? "Unknown",
            CreatedAt = report.CreatedAt
        };

        return ApiResponse<ReportDetailDto>.Succeeded(dto);
    }
}
