using FluentValidation;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.KeywordGroups;

public record CreateKeywordGroupCommand(Guid ProjectId, string Name, string? ColorHex) : IRequest<KeywordGroupDto>;

public class CreateKeywordGroupCommandValidator : AbstractValidator<CreateKeywordGroupCommand>
{
    public CreateKeywordGroupCommandValidator()
    {
        RuleFor(v => v.ProjectId).NotEmpty().WithMessage("ProjectId is required.");
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Group name is required.")
            .MaximumLength(100).WithMessage("Group name cannot exceed 100 characters.");
        RuleFor(v => v.ColorHex)
            .MaximumLength(7).WithMessage("ColorHex cannot exceed 7 characters (e.g. #3B82F6).");
    }
}

public class CreateKeywordGroupCommandHandler : IRequestHandler<CreateKeywordGroupCommand, KeywordGroupDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public CreateKeywordGroupCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<KeywordGroupDto> Handle(CreateKeywordGroupCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsArchived, cancellationToken);

        if (project == null)
        {
            throw new NotFoundException(nameof(Project), request.ProjectId);
        }

        var trimmedName = request.Name.Trim();
        var exists = await _context.KeywordGroups
            .AnyAsync(g => g.ProjectId == request.ProjectId && g.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (exists)
        {
            throw new Common.Exceptions.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(nameof(request.Name), $"A group with name '{trimmedName}' already exists in this project.")
            });
        }

        var group = new KeywordGroup
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Name = trimmedName,
            ColorHex = string.IsNullOrWhiteSpace(request.ColorHex) ? "#3B82F6" : request.ColorHex.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.KeywordGroups.Add(group);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "KeywordGroup.Created",
            entityType: "KeywordGroup",
            entityId: group.Id.ToString(),
            projectId: group.ProjectId,
            payload: new { group.Name, group.ColorHex },
            cancellationToken: cancellationToken);

        return new KeywordGroupDto
        {
            Id = group.Id,
            ProjectId = group.ProjectId,
            Name = group.Name,
            ColorHex = group.ColorHex,
            KeywordCount = 0,
            CreatedAt = group.CreatedAt
        };
    }
}

public record DeleteKeywordGroupCommand(Guid ProjectId, Guid Id) : IRequest<bool>;

public class DeleteKeywordGroupCommandHandler : IRequestHandler<DeleteKeywordGroupCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DeleteKeywordGroupCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<bool> Handle(DeleteKeywordGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _context.KeywordGroups
            .FirstOrDefaultAsync(g => g.Id == request.Id && g.ProjectId == request.ProjectId, cancellationToken);

        if (group == null)
        {
            throw new NotFoundException(nameof(KeywordGroup), request.Id);
        }

        var groupName = group.Name;
        _context.KeywordGroups.Remove(group);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "KeywordGroup.Deleted",
            entityType: "KeywordGroup",
            entityId: request.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { GroupName = groupName },
            cancellationToken: cancellationToken);

        return true;
    }
}
