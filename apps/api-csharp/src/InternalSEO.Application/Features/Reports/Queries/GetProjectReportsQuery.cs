using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Reports.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Reports.Queries;

public record GetProjectReportsQuery(Guid ProjectId) : IRequest<ApiResponse<List<ReportSummaryDto>>>;

public class GetProjectReportsQueryHandler : IRequestHandler<GetProjectReportsQuery, ApiResponse<List<ReportSummaryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetProjectReportsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ReportSummaryDto>>> Handle(GetProjectReportsQuery request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects
            .AsNoTracking()
            .AnyAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (!projectExists)
        {
            throw new NotFoundException($"Project with ID {request.ProjectId} not found.");
        }

        var reports = await _context.ReportRuns
            .AsNoTracking()
            .Include(r => r.CreatedByUser)
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReportSummaryDto
            {
                Id = r.Id,
                ProjectId = r.ProjectId,
                Title = r.Title,
                ExecutiveSummary = r.ExecutiveSummary,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                Sections = r.Sections,
                CreatedByUserId = r.CreatedByUserId,
                CreatedByUserName = r.CreatedByUser.FullName ?? r.CreatedByUser.Email ?? "Unknown",
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<ReportSummaryDto>>.Succeeded(reports);
    }
}
