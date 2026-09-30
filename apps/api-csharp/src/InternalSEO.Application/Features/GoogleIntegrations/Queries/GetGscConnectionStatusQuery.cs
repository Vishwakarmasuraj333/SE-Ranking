using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscConnectionStatusQuery(Guid ProjectId) : IRequest<ApiResponse<GscConnectionDto?>>;

public class GetGscConnectionStatusQueryHandler : IRequestHandler<GetGscConnectionStatusQuery, ApiResponse<GscConnectionDto?>>
{
    private readonly IApplicationDbContext _context;

    public GetGscConnectionStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<GscConnectionDto?>> Handle(GetGscConnectionStatusQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<GscConnectionDto?>.Succeeded(null);
        }

        var dto = new GscConnectionDto(
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

        return ApiResponse<GscConnectionDto?>.Succeeded(dto);
    }
}
