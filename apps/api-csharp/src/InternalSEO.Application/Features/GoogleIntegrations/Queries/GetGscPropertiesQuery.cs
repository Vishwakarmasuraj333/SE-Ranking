using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Queries;

public record GetGscPropertiesQuery(Guid ProjectId) : IRequest<ApiResponse<IReadOnlyList<GscPropertyDto>>>;

public class GetGscPropertiesQueryHandler : IRequestHandler<GetGscPropertiesQuery, ApiResponse<IReadOnlyList<GscPropertyDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IGoogleAuthService _authService;
    private readonly IGoogleSearchConsoleClient _gscClient;

    public GetGscPropertiesQueryHandler(
        IApplicationDbContext context,
        ITokenEncryptionService encryptionService,
        IGoogleAuthService authService,
        IGoogleSearchConsoleClient gscClient)
    {
        _context = context;
        _encryptionService = encryptionService;
        _authService = authService;
        _gscClient = gscClient;
    }

    public async Task<ApiResponse<IReadOnlyList<GscPropertyDto>>> Handle(GetGscPropertiesQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Gsc, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<IReadOnlyList<GscPropertyDto>>.Failed("No Google connection found. Please connect your Google account first.");
        }

        try
        {
            var refreshToken = _encryptionService.Decrypt(connection.EncryptedRefreshToken);
            var tokenResult = await _authService.RefreshAccessTokenAsync(refreshToken, cancellationToken);
            var properties = await _gscClient.GetAccessiblePropertiesAsync(tokenResult.AccessToken, cancellationToken);

            var dtos = properties.Select(p => new GscPropertyDto(
                p.PropertyIdentifier,
                p.PermissionLevel,
                p.SiteUrl
            )).ToList();

            return ApiResponse<IReadOnlyList<GscPropertyDto>>.Succeeded(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<IReadOnlyList<GscPropertyDto>>.Failed($"Failed to load Search Console properties: {ex.Message}");
        }
    }
}
