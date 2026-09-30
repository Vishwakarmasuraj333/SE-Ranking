namespace InternalSEO.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsSuperAdmin { get; }
    bool IsAuthenticated { get; }
    string? IpAddress { get; }
}
