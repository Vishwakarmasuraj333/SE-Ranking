using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Commands;

public record DeleteCompetitorCommand(
    Guid ProjectId,
    Guid CompetitorId
) : IRequest<ApiResponse<bool>>;

public class DeleteCompetitorCommandValidator : AbstractValidator<DeleteCompetitorCommand>
{
    public DeleteCompetitorCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

        RuleFor(x => x.CompetitorId)
            .NotEmpty().WithMessage("CompetitorId is required.");
    }
}

public class DeleteCompetitorCommandHandler : IRequestHandler<DeleteCompetitorCommand, ApiResponse<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DeleteCompetitorCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = await _context.Competitors
            .FirstOrDefaultAsync(c => c.Id == request.CompetitorId && c.ProjectId == request.ProjectId, cancellationToken);

        if (competitor == null)
            throw new NotFoundException(nameof(Competitor), request.CompetitorId);

        _context.Competitors.Remove(competitor);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Competitor.Deleted",
            entityType: nameof(Competitor),
            entityId: competitor.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { competitor.Name, competitor.Domain },
            cancellationToken: cancellationToken);

        return ApiResponse<bool>.Succeeded(true);
    }
}
