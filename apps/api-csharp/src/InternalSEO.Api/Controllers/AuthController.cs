using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Auth.Commands.Login;
using InternalSEO.Application.Features.Auth.Commands.RefreshToken;
using InternalSEO.Application.Features.Auth.DTOs;
using InternalSEO.Application.Features.Auth.Queries.GetCurrentUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InternalSEO.Api.Controllers;

public class AuthController : BaseApiController
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken, result.ExpiresAt);
        return Success(result, "Authentication successful.");
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequest? body)
    {
        var refreshToken = body?.RefreshToken ?? Request.Cookies["refreshToken"];

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return BadRequest(ApiResponse<AuthResponseDto>.Failed("Refresh token is required."));
        }

        var result = await Mediator.Send(new RefreshTokenCommand(refreshToken));
        SetRefreshTokenCookie(result.RefreshToken, result.ExpiresAt);
        return Success(result, "Token refreshed successfully.");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        var result = await Mediator.Send(new GetCurrentUserQuery());
        return Success(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax
        });

        return Ok(ApiResponse<bool>.Succeeded(true, "Logged out successfully."));
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTimeOffset expiresAt)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt.AddDays(14)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}

public class RefreshTokenRequest
{
    public string? RefreshToken { get; set; }
}
