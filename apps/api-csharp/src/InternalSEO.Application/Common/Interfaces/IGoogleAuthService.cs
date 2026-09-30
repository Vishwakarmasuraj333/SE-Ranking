using InternalSEO.Application.Common.Models;

namespace InternalSEO.Application.Common.Interfaces;

public interface IGoogleAuthService
{
    string GenerateAuthorizationUrl(Guid projectId, string state, string? scope = null);
    Task<GoogleTokenExchangeResult> ExchangeAuthorizationCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default);
    Task<GoogleTokenRefreshResult> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}
