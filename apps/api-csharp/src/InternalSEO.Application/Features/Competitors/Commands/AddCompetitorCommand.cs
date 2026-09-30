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

public record AddCompetitorCommand(
    Guid ProjectId,
    string Name,
    string Domain,
    string? Notes
) : IRequest<ApiResponse<CompetitorDto>>;

public class AddCompetitorCommandValidator : AbstractValidator<AddCompetitorCommand>
{
    private readonly IApplicationDbContext _context;

    public AddCompetitorCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");

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
                {
                    // Handled in handler as NotFoundException
                    return;
                }

                if (project.Competitors.Count >= 5)
                {
                    validationContext.AddFailure("Competitors", "A maximum of 5 competitors per project is allowed.");
                    return;
                }

                var normalizedDomain = CompetitorNormalizer.NormalizeDomain(cmd.Domain);
                var normalizedTargetDomain = CompetitorNormalizer.NormalizeDomain(project.PrimaryDomain);

                if (string.Equals(normalizedDomain, normalizedTargetDomain, StringComparison.OrdinalIgnoreCase))
                {
                    validationContext.AddFailure("Domain", "Competitor domain cannot be the project primary domain.");
                    return;
                }

                var isDuplicate = project.Competitors.Any(c =>
                    string.Equals(CompetitorNormalizer.NormalizeDomain(c.Domain), normalizedDomain, StringComparison.OrdinalIgnoreCase));

                if (isDuplicate)
                {
                    validationContext.AddFailure("Domain", "A competitor with this domain already exists in this project.");
                }
            });
    }
}

public class AddCompetitorCommandHandler : IRequestHandler<AddCompetitorCommand, ApiResponse<CompetitorDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;
    private readonly ICurrentUserService _currentUserService;

    public AddCompetitorCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _activityLogger = activityLogger;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<CompetitorDto>> Handle(AddCompetitorCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Competitors)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new NotFoundException(nameof(Project), request.ProjectId);

        var normalizedDomain = CompetitorNormalizer.NormalizeDomain(request.Domain);

        var competitor = new Competitor
        {
            ProjectId = request.ProjectId,
            Name = request.Name.Trim(),
            Domain = normalizedDomain,
            Notes = request.Notes?.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = _currentUserService.UserId ?? Guid.Empty
        };

        _context.Competitors.Add(competitor);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Competitor.Added",
            entityType: nameof(Competitor),
            entityId: competitor.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { competitor.Name, competitor.Domain },
            cancellationToken: cancellationToken);

        var dto = new CompetitorDto
        {
            Id = competitor.Id,
            ProjectId = competitor.ProjectId,
            Name = competitor.Name,
            Domain = competitor.Domain,
            Notes = competitor.Notes,
            CreatedAt = competitor.CreatedAt,
            UpdatedAt = competitor.UpdatedAt,
            LastCheckedAt = null
        };

        return ApiResponse<CompetitorDto>.Succeeded(dto);
    }
}
