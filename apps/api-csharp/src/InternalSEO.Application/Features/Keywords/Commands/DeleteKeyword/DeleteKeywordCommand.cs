using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Application.Features.Keywords.Commands.DeleteKeyword;

public record DeleteKeywordCommand(Guid ProjectId, Guid Id) : IRequest<bool>;

public class DeleteKeywordCommandHandler : IRequestHandler<DeleteKeywordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public DeleteKeywordCommandHandler(
        IApplicationDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<bool> Handle(DeleteKeywordCommand request, CancellationToken cancellationToken)
    {
        var keyword = await _context.Keywords
            .FirstOrDefaultAsync(k => k.Id == request.Id && k.ProjectId == request.ProjectId, cancellationToken);

        if (keyword == null)
        {
            throw new NotFoundException(nameof(Keyword), request.Id);
        }

        var keywordText = keyword.KeywordText;
        _context.Keywords.Remove(keyword);
        await _context.SaveChangesAsync(cancellationToken);

        await _activityLogger.LogAsync(
            actionType: "Keyword.Deleted",
            entityType: "Keyword",
            entityId: request.Id.ToString(),
            projectId: request.ProjectId,
            payload: new { KeywordText = keywordText },
            cancellationToken: cancellationToken);

        return true;
    }
}
