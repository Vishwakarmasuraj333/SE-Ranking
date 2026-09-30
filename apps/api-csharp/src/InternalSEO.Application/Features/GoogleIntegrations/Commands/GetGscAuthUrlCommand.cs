using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.GoogleIntegrations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.GoogleIntegrations.Commands;

public record GetGscAuthUrlCommand(Guid ProjectId) : IRequest<ApiResponse<GscAuthUrlDto>>;

public class GetGscAuthUrlCommandHandler : IRequestHandler<GetGscAuthUrlCommand, ApiResponse<GscAuthUrlDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IGoogleAuthService _authService;

    public GetGscAuthUrlCommandHandler(IApplicationDbContext context, IGoogleAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    public async Task<ApiResponse<GscAuthUrlDto>> Handle(GetGscAuthUrlCommand request, CancellationToken cancellationToken)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
        if (!projectExists)
        {
            return ApiResponse<GscAuthUrlDto>.Failed("Project not found.");
        }

        var state = $"{request.ProjectId}:{Guid.NewGuid():N}";
        var authUrl = _authService.GenerateAuthorizationUrl(request.ProjectId, state);

        return ApiResponse<GscAuthUrlDto>.Succeeded(new GscAuthUrlDto(authUrl, state));
    }
}
