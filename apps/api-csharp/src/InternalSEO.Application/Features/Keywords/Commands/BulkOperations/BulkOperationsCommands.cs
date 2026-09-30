using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.BulkOperations;

// 1. Bulk Status Update
public record BulkUpdateKeywordStatusCommand(Guid ProjectId, List<Guid> KeywordIds, bool IsActive) : IRequest<int>;

public class BulkUpdateKeywordStatusCommandHandler : IRequestHandler<BulkUpdateKeywordStatusCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public BulkUpdateKeywordStatusCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<int> Handle(BulkUpdateKeywordStatusCommand request, CancellationToken cancellationToken)
    {
        var keywords = await _context.Keywords
            .Where(k => k.ProjectId == request.ProjectId && request.KeywordIds.Contains(k.Id))
            .ToListAsync(cancellationToken);

        foreach (var kw in keywords)
        {
            kw.IsActive = request.IsActive;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.BulkStatusUpdated",
            entityType: "Keyword",
            entityId: request.ProjectId.ToString(),
            projectId: request.ProjectId,
            payload: new { Count = keywords.Count, request.IsActive },
            cancellationToken: cancellationToken);

        return keywords.Count;
    }
}

// 2. Bulk Assign Group
public record BulkAssignGroupCommand(Guid ProjectId, List<Guid> KeywordIds, Guid? GroupId) : IRequest<int>;

public class BulkAssignGroupCommandHandler : IRequestHandler<BulkAssignGroupCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public BulkAssignGroupCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<int> Handle(BulkAssignGroupCommand request, CancellationToken cancellationToken)
    {
        if (request.GroupId.HasValue)
        {
            var groupExists = await _context.KeywordGroups.AnyAsync(
                g => g.Id == request.GroupId.Value && g.ProjectId == request.ProjectId, cancellationToken);
            if (!groupExists)
            {
                throw new NotFoundException(nameof(KeywordGroup), request.GroupId.Value);
            }
        }

        var keywords = await _context.Keywords
            .Where(k => k.ProjectId == request.ProjectId && request.KeywordIds.Contains(k.Id))
            .ToListAsync(cancellationToken);

        foreach (var kw in keywords)
        {
            kw.GroupId = request.GroupId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.BulkGroupAssigned",
            entityType: "Keyword",
            entityId: request.ProjectId.ToString(),
            projectId: request.ProjectId,
            payload: new { Count = keywords.Count, request.GroupId },
            cancellationToken: cancellationToken);

        return keywords.Count;
    }
}

// 3. Bulk Delete
public record BulkDeleteKeywordsCommand(Guid ProjectId, List<Guid> KeywordIds) : IRequest<int>;

public class BulkDeleteKeywordsCommandHandler : IRequestHandler<BulkDeleteKeywordsCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public BulkDeleteKeywordsCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<int> Handle(BulkDeleteKeywordsCommand request, CancellationToken cancellationToken)
    {
        var keywords = await _context.Keywords
            .Where(k => k.ProjectId == request.ProjectId && request.KeywordIds.Contains(k.Id))
            .ToListAsync(cancellationToken);

        _context.Keywords.RemoveRange(keywords);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.BulkDeleted",
            entityType: "Keyword",
            entityId: request.ProjectId.ToString(),
            projectId: request.ProjectId,
            payload: new { Count = keywords.Count },
            cancellationToken: cancellationToken);

        return keywords.Count;
    }
}
