using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GoogleAuthService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public string GenerateAuthorizationUrl(Guid projectId, string state, string? scope = null)
    {
        var clientId = _configuration["Google:ClientId"] ?? "mock-client-id";
        var redirectUri = _configuration["Google:RedirectUri"] ?? "http://localhost:3000/api/auth/callback/google";
        var resolvedScope = scope ?? "https://www.googleapis.com/auth/webmasters.readonly email profile";

        return $"https://accounts.google.com/o/oauth2/v2/auth?client_id={clientId}&redirect_uri={Uri.EscapeDataString(redirectUri)}&response_type=code&scope={Uri.EscapeDataString(resolvedScope)}&access_type=offline&prompt=consent&state={state}";
    }

    public async Task<GoogleTokenExchangeResult> ExchangeAuthorizationCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google:ClientId is not configured.");
        var clientSecret = _configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google:ClientSecret is not configured.");

        var dict = new Dictionary<string, string>
        {
            { "code", code },
            { "client_id", clientId },
            { "client_secret", clientSecret },
            { "redirect_uri", redirectUri },
            { "grant_type", "authorization_code" }
        };

        var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(dict), cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Google token exchange failed with status {StatusCode}", response.StatusCode);
            throw new InvalidOperationException($"Google OAuth code exchange failed: {response.StatusCode}");
        }

        var tokenResponse = await response.Content.ReadFromJsonAsync<GoogleTokenPayload>(cancellationToken: cancellationToken);
        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            throw new InvalidOperationException("Invalid token response received from Google.");
        }

        // Fetch user email
        var accountEmail = "unknown@google.com";
        try
        {
            using var userInfoReq = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
            userInfoReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);
            var userRes = await _httpClient.SendAsync(userInfoReq, cancellationToken);
            if (userRes.IsSuccessStatusCode)
            {
                var userPayload = await userRes.Content.ReadFromJsonAsync<GoogleUserInfoPayload>(cancellationToken: cancellationToken);
                if (!string.IsNullOrEmpty(userPayload?.Email))
                {
                    accountEmail = userPayload.Email;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve Google userinfo email, fallback to default.");
        }

        return new GoogleTokenExchangeResult(
            AccessToken: tokenResponse.AccessToken,
            RefreshToken: tokenResponse.RefreshToken ?? string.Empty,
            ExpiresInSeconds: tokenResponse.ExpiresIn,
            AccountEmail: accountEmail,
            Scope: tokenResponse.Scope ?? string.Empty
        );
    }

    public async Task<GoogleTokenRefreshResult> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google:ClientId is not configured.");
        var clientSecret = _configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google:ClientSecret is not configured.");

        var dict = new Dictionary<string, string>
        {
            { "client_id", clientId },
            { "client_secret", clientSecret },
            { "refresh_token", refreshToken },
            { "grant_type", "refresh_token" }
        };

        var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(dict), cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Google token refresh failed with status {StatusCode}", response.StatusCode);
            string? errorCode = null;
            string? errorDesc = null;
            try
            {
                var errorObj = await response.Content.ReadFromJsonAsync<GoogleOAuthErrorResponse>(cancellationToken: cancellationToken);
                errorCode = errorObj?.Error;
                errorDesc = errorObj?.ErrorDescription;
            }
            catch
            {
                // Non-JSON error response from Google
            }

            // Structured classification: OAuth token is invalid/revoked/expired
            bool isAuthFailure = response.StatusCode == HttpStatusCode.Unauthorized ||
                                 (response.StatusCode == HttpStatusCode.BadRequest &&
                                  (string.Equals(errorCode, "invalid_grant", StringComparison.OrdinalIgnoreCase) ||
                                   string.Equals(errorCode, "unauthorized_client", StringComparison.OrdinalIgnoreCase) ||
                                   string.Equals(errorCode, "invalid_client", StringComparison.OrdinalIgnoreCase)));

            throw new GoogleOAuthException(
                $"Google token refresh failed with status {response.StatusCode} and error code '{errorCode}'.",
                response.StatusCode,
                errorCode,
                isAuthFailure);
        }

        var tokenResponse = await response.Content.ReadFromJsonAsync<GoogleTokenPayload>(cancellationToken: cancellationToken);
        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            throw new InvalidOperationException("Invalid token refresh response from Google.");
        }

        return new GoogleTokenRefreshResult(
            AccessToken: tokenResponse.AccessToken,
            ExpiresInSeconds: tokenResponse.ExpiresIn
        );
    }

    private class GoogleTokenPayload
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [JsonPropertyName("scope")]
        public string? Scope { get; set; }
    }

    private class GoogleUserInfoPayload
    {
        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }

    private class GoogleOAuthErrorResponse
    {
        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }
    }
}
