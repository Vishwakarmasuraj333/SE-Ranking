using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Queries;

public record GetGa4ConnectionStatusQuery(Guid ProjectId) : IRequest<ApiResponse<Ga4ConnectionDto?>>;

public class GetGa4ConnectionStatusQueryHandler : IRequestHandler<GetGa4ConnectionStatusQuery, ApiResponse<Ga4ConnectionDto?>>
{
    private readonly IApplicationDbContext _context;

    public GetGa4ConnectionStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<Ga4ConnectionDto?>> Handle(GetGa4ConnectionStatusQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<Ga4ConnectionDto?>.Succeeded(null);
        }

        var dto = new Ga4ConnectionDto(
            connection.Id,
            connection.ProjectId,
            connection.ServiceType,
            connection.PropertyIdentifier,
            connection.AccountEmail,
            connection.SyncStatus,
            connection.LastSyncedAt,
            connection.LastErrorMessage,
            connection.CreatedAt,
            connection.UpdatedAt
        );

        return ApiResponse<Ga4ConnectionDto?>.Succeeded(dto);
    }
}
