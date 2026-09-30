using InternalSEO.Domain.Entities;

namespace InternalSEO.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user, string role);
    string GenerateRefreshToken();
    int GetRefreshTokenExpiryDays();
}
