using System;

namespace InternalSEO.Application.Features.ActivityLogs.DTOs;

public record ActivityLogDto(
    long Id,
    Guid? ActorId,
    string ActorEmail,
    string ActorRole,
    string ActionType,
    string EntityType,
    string EntityId,
    Guid? ProjectId,
    string? ProjectName,
    string? PayloadJson,
    string? IpAddress,
    DateTimeOffset CreatedAt
);
