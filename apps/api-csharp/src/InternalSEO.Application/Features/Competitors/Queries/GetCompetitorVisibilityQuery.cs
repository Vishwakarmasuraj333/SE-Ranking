using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.DTOs;
using MediatR;

namespace InternalSEO.Application.Features.Competitors.Queries;

public record GetCompetitorVisibilityQuery(Guid ProjectId, int Days = 30) : IRequest<ApiResponse<CompetitorVisibilityResponseDto>>;

public class GetCompetitorVisibilityQueryHandler : IRequestHandler<GetCompetitorVisibilityQuery, ApiResponse<CompetitorVisibilityResponseDto>>
{
    private readonly IMediator _mediator;

    public GetCompetitorVisibilityQueryHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ApiResponse<CompetitorVisibilityResponseDto>> Handle(GetCompetitorVisibilityQuery request, CancellationToken cancellationToken)
    {
        var overviewResult = await _mediator.Send(new GetCompetitorOverviewQuery(request.ProjectId, request.Days), cancellationToken);
        var overview = overviewResult.Data;
        if (overview == null)
        {
            return ApiResponse<CompetitorVisibilityResponseDto>.Failed(overviewResult.Message ?? "Failed to calculate competitor visibility.");
        }

        var response = new CompetitorVisibilityResponseDto
        {
            ProjectId = overview.ProjectId,
            TargetDomain = overview.TargetDomain,
            TotalKeywordsCount = overview.TotalKeywordsCount,
            LastCheckedAt = overview.LastCheckedAt,
            LatestCheckDate = overview.LatestCheckDate,
            IsStale = overview.IsStale,
            Summaries = overview.Summaries
        };

        return ApiResponse<CompetitorVisibilityResponseDto>.Succeeded(response);
    }
}
