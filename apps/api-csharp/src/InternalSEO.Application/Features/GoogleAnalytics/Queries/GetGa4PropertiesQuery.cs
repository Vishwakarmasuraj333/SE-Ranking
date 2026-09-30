using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Queries;

public record GetGa4PropertiesQuery(Guid ProjectId) : IRequest<ApiResponse<IReadOnlyList<Ga4PropertyDto>>>;

public class GetGa4PropertiesQueryHandler : IRequestHandler<GetGa4PropertiesQuery, ApiResponse<IReadOnlyList<Ga4PropertyDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenEncryptionService _encryptionService;
    private readonly IGoogleAuthService _authService;
    private readonly IGoogleAnalyticsClient _ga4Client;

    public GetGa4PropertiesQueryHandler(
        IApplicationDbContext context,
        ITokenEncryptionService encryptionService,
        IGoogleAuthService authService,
        IGoogleAnalyticsClient ga4Client)
    {
        _context = context;
        _encryptionService = encryptionService;
        _authService = authService;
        _ga4Client = ga4Client;
    }

    public async Task<ApiResponse<IReadOnlyList<Ga4PropertyDto>>> Handle(GetGa4PropertiesQuery request, CancellationToken cancellationToken)
    {
        var connection = await _context.GoogleConnections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProjectId == request.ProjectId && c.ServiceType == GoogleConstants.ServiceTypes.Ga4, cancellationToken);

        if (connection == null)
        {
            return ApiResponse<IReadOnlyList<Ga4PropertyDto>>.Failed("No Google connection found. Please connect your Google account first.");
        }

        try
        {
            var refreshToken = _encryptionService.Decrypt(connection.EncryptedRefreshToken);
            var tokenResult = await _authService.RefreshAccessTokenAsync(refreshToken, cancellationToken);
            var properties = await _ga4Client.GetAccessiblePropertiesAsync(tokenResult.AccessToken, cancellationToken);

            var dtos = properties.Select(p => new Ga4PropertyDto(
                p.PropertyIdentifier,
                p.DisplayName,
                p.AccountName
            )).ToList();

            return ApiResponse<IReadOnlyList<Ga4PropertyDto>>.Succeeded(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<IReadOnlyList<Ga4PropertyDto>>.Failed($"Failed to load Google Analytics 4 properties: {ex.Message}");
        }
    }
}
