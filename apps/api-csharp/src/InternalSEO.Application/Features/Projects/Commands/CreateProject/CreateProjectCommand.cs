using System.Text.RegularExpressions;
using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.DTOs;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Projects.Commands.CreateProject;

public record CreateProjectCommand : IRequest<ProjectDto>
{
    public string Name { get; init; } = string.Empty;
    public string PrimaryDomain { get; init; } = string.Empty;
    public string Protocol { get; init; } = "https://";
    public string? Industry { get; init; }
    public string CountryCode { get; init; } = "US";
    public string? PrimaryLocation { get; init; }
    public string LanguageCode { get; init; } = "en";
    public string Timezone { get; init; } = "UTC";
    public string DefaultSearchEngine { get; init; } = "google";
    public string DefaultDevice { get; init; } = "desktop";
}

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Project name is required.")
            .MaximumLength(200).WithMessage("Project name cannot exceed 200 characters.");

        RuleFor(v => v.PrimaryDomain)
            .NotEmpty().WithMessage("Primary domain is required.")
            .MaximumLength(255).WithMessage("Primary domain cannot exceed 255 characters.")
            .Must(BeAValidDomain).WithMessage("Primary domain must be a valid domain name (e.g., example.com).");

        RuleFor(v => v.Protocol)
            .NotEmpty().WithMessage("Protocol is required.")
            .Must(p => p == "https://" || p == "http://" || p == "https" || p == "http")
            .WithMessage("Protocol must be 'https://' or 'http://'.");

        RuleFor(v => v.CountryCode)
            .NotEmpty().WithMessage("Country code is required.")
            .Length(2).WithMessage("Country code must be 2 characters (e.g. US, GB).");

        RuleFor(v => v.LanguageCode)
            .NotEmpty().WithMessage("Language code is required.")
            .MinimumLength(2).MaximumLength(5).WithMessage("Language code must be between 2 and 5 characters.");
    }

    private static bool BeAValidDomain(string domain)
    {
        if (string.IsNullOrWhiteSpace(domain)) return false;
        var clean = domain.Replace("http://", "").Replace("https://", "").Trim().TrimEnd('/');
        return clean.Contains('.') && !clean.Contains(' ') && clean.Length >= 3;
    }
}

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityLogger _activityLogger;

    public CreateProjectCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IActivityLogger activityLogger)
    {
        _context = context;
        _currentUser = currentUser;
        _activityLogger = activityLogger;
    }

    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
        {
            throw new ForbiddenException("Only Super Admins can create new projects.");
        }

        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        // Clean domain
        var cleanDomain = request.PrimaryDomain
            .Replace("http://", "", StringComparison.OrdinalIgnoreCase)
            .Replace("https://", "", StringComparison.OrdinalIgnoreCase)
            .Trim()
            .TrimEnd('/')
            .ToLowerInvariant();

        // Check if project domain already exists and active
        var exists = await _context.Projects
            .AnyAsync(p => p.PrimaryDomain == cleanDomain && !p.IsArchived, cancellationToken);

        if (exists)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(nameof(request.PrimaryDomain), $"A project with primary domain '{cleanDomain}' already exists.")
            });
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            PrimaryDomain = cleanDomain,
            Protocol = request.Protocol.Contains("://") ? request.Protocol : request.Protocol + "://",
            Industry = request.Industry?.Trim(),
            CountryCode = request.CountryCode.ToUpperInvariant(),
            PrimaryLocation = request.PrimaryLocation?.Trim(),
            LanguageCode = request.LanguageCode.ToLowerInvariant(),
            Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? "UTC" : request.Timezone.Trim(),
            DefaultSearchEngine = string.IsNullOrWhiteSpace(request.DefaultSearchEngine) ? "google" : request.DefaultSearchEngine.Trim().ToLowerInvariant(),
            DefaultDevice = string.IsNullOrWhiteSpace(request.DefaultDevice) ? "desktop" : request.DefaultDevice.Trim().ToLowerInvariant(),
            Status = ProjectStatus.Active,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        // Add creator as owner member
        project.Members.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            UserId = userId,
            AccessLevel = ProjectAccessLevel.Owner,
            AssignedAt = DateTimeOffset.UtcNow,
            AssignedBy = userId
        });

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Project.Created",
            entityType: "Project",
            entityId: project.Id.ToString(),
            projectId: project.Id,
            payload: new { project.Name, project.PrimaryDomain, project.CountryCode },
            cancellationToken: cancellationToken);

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            PrimaryDomain = project.PrimaryDomain,
            Protocol = project.Protocol,
            Industry = project.Industry,
            CountryCode = project.CountryCode,
            PrimaryLocation = project.PrimaryLocation,
            LanguageCode = project.LanguageCode,
            Timezone = project.Timezone,
            DefaultSearchEngine = project.DefaultSearchEngine,
            DefaultDevice = project.DefaultDevice,
            Status = project.Status,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            MemberCount = 1,
            UserAccessLevel = ProjectAccessLevel.Owner.ToString()
        };
    }
}
