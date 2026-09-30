using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.Common;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Competitors.Commands;

public record UpdateCompetitorCommand(
    Guid ProjectId,
    Guid CompetitorId,
    string Name,
    string Domain,
    string? Notes
) : IRequest<ApiResponse<CompetitorDto>>;

public class UpdateCompetitorCommandValidator : AbstractValidator<UpdateCompetitorCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateCompetitorCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

        RuleFor(x => x.CompetitorId)
            .NotEmpty().WithMessage("CompetitorId is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Competitor name is required.")
            .MaximumLength(100).WithMessage("Competitor name must not exceed 100 characters.");

        RuleFor(x => x.Domain)
            .NotEmpty().WithMessage("Competitor domain is required.")
            .MaximumLength(255).WithMessage("Competitor domain must not exceed 255 characters.")
            .Must(d => !string.IsNullOrWhiteSpace(CompetitorNormalizer.NormalizeDomain(d)))
            .WithMessage("Invalid domain format.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");

        RuleFor(x => x)
            .CustomAsync(async (cmd, validationContext, cancellationToken) =>
            {
                var project = await _context.Projects
                    .AsNoTracking()
                    .Include(p => p.Competitors)
                    .FirstOrDefaultAsync(p => p.Id == cmd.ProjectId, cancellationToken);

                if (project == null)
                    return;

                var normalizedDomain = CompetitorNormalizer.NormalizeDomain(cmd.Domain);
                var normalizedTargetDomain = CompetitorNormalizer.NormalizeDomain(project.PrimaryDomain);

                if (string.Equals(normalizedDomain, normalizedTargetDomain, StringComparison.OrdinalIgnoreCase))
                {
                    validationContext.AddFailure("Domain", "Competitor domain cannot be the project primary domain.");
                    return;
                }

                var isDuplicate = project.Competitors.Any(c =>
                    c.Id != cmd.CompetitorId &&
                    string.Equals(CompetitorNormalizer.NormalizeDomain(c.Domain), normalizedDomain, StringComparison.OrdinalIgnoreCase));

                if (isDuplicate)
                {
                    validationContext.AddFailure("Domain", "A competitor with this domain already exists in this project.");
                }
            });
    }
}

public class UpdateCompetitorCommandHandler : IRequestHandler<UpdateCompetitorCommand, ApiResponse<CompetitorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCompetitorCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<CompetitorDto>> Handle(UpdateCompetitorCommand request, CancellationToken cancellationToken)
    {
        var competitor = await _context.Competitors
            .FirstOrDefaultAsync(c => c.Id == request.CompetitorId && c.ProjectId == request.ProjectId, cancellationToken);

        if (competitor == null)
            throw new NotFoundException(nameof(Competitor), request.CompetitorId);

        var normalizedDomain = CompetitorNormalizer.NormalizeDomain(request.Domain);

        competitor.Name = request.Name.Trim();
        competitor.Domain = normalizedDomain;
        competitor.Notes = request.Notes?.Trim();
        competitor.UpdatedAt = DateTimeOffset.UtcNow;
        competitor.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Competitor.Updated",
            entityType: nameof(Competitor),
            entityId: competitor.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { competitor.Name, competitor.Domain },
            cancellationToken: cancellationToken);

        var lastCheckedAt = await _context.CompetitorRankResults
            .Where(cr => cr.CompetitorId == competitor.Id)
            .OrderByDescending(cr => cr.RecordedAt)
            .Select(cr => (DateTimeOffset?)cr.RecordedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var dto = new CompetitorDto
        {
            Id = competitor.Id,
            ProjectId = competitor.ProjectId,
            Name = competitor.Name,
            Domain = competitor.Domain,
            Notes = competitor.Notes,
            CreatedAt = competitor.CreatedAt,
            UpdatedAt = competitor.UpdatedAt,
            LastCheckedAt = lastCheckedAt
        };

        return ApiResponse<CompetitorDto>.Succeeded(dto);
    }
}
