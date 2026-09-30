using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleAnalytics.DTOs;
using InternalSEO.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleAnalytics.Commands;

public record GetGa4AuthUrlCommand(Guid ProjectId) : IRequest<ApiResponse<Ga4AuthUrlDto>>;

public class GetGa4AuthUrlCommandHandler : IRequestHandler<GetGa4AuthUrlCommand, ApiResponse<Ga4AuthUrlDto>>
{
    private const string Ga4Scope = "https://www.googleapis.com/auth/analytics.readonly email profile";
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAuthService _authService;
    private readonly IOAuthNonceService _oauthNonceService;
    private readonly ICurrentUserService _currentUserService;

    public GetGa4AuthUrlCommandHandler(
        IApplicationDbContext context,
        IGoogleAuthService authService,
        IOAuthNonceService oauthNonceService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _authService = authService;
        _oauthNonceService = oauthNonceService;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<Ga4AuthUrlDto>> Handle(GetGa4AuthUrlCommand request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (!projectExists)
        {
            return ApiResponse<Ga4AuthUrlDto>.Failed("Project not found.");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value == Guid.Empty)
        {
            return ApiResponse<Ga4AuthUrlDto>.Failed("User is not authenticated.");
        }

        var state = await _oauthNonceService.GenerateAndStoreNonceAsync(
            request.ProjectId,
            userId.Value,
            GoogleConstants.ServiceTypes.Ga4,
            cancellationToken);

        var authUrl = _authService.GenerateAuthorizationUrl(request.ProjectId, state, Ga4Scope);

        return ApiResponse<Ga4AuthUrlDto>.Succeeded(new Ga4AuthUrlDto(authUrl, state));
    }
}
