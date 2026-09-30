using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Auth.Commands.Login;
using InternalSEO.Application.Features.Auth.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Tests.Integration.Common;
using Xunit;

namespace InternalSEO.Tests.Integration.Auth;

public class AuthEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccessAndJwt()
    {
        // Arrange
        var request = new LoginCommand("admin@company.internal", "AdminPassword123!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.AccessToken.Should().NotBeNullOrWhiteSpace();
        content.Data.RefreshToken.Should().NotBeNullOrWhiteSpace();
        content.Data.User.Email.Should().Be("admin@company.internal");
        content.Data.User.Role.Should().Be(SystemRoles.SuperAdmin);

        // Refresh token cookie
        response.Headers.Contains("Set-Cookie").Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_Returns401Unauthorized()
    {
        // Arrange
        var request = new LoginCommand("admin@company.internal", "WrongPassword!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
    }

    [Theory]
    [InlineData("admin@internal-seo.local", "AdminPassword123!", SystemRoles.SuperAdmin)]
    [InlineData("exec@internal-seo.local", "ExecPassword123!", SystemRoles.SEOExecutive)]
    [InlineData("viewer@internal-seo.local", "ViewerPassword123!", SystemRoles.Viewer)]
    public async Task Login_WithSeededDevelopmentAccounts_AuthenticatesSuccessfully(string email, string password, string expectedRole)
    {
        // Arrange
        var request = new LoginCommand(email, password);

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        content.Should().NotBeNull();
        content!.Success.Should().BeTrue();
        content.Data!.User.Email.Should().Be(email);
        content.Data.User.Role.Should().Be(expectedRole);
        content.Data.AccessToken.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetMe_WhenAuthenticated_ReturnsCurrentProfile()
    {
        // Arrange
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Act
        var response = await client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
        content.Should().NotBeNull();
        content!.Data!.Email.Should().Be("seo@company.internal");
        content.Data.Role.Should().Be(SystemRoles.SEOExecutive);
        content.Data.AssignedProjectIds.Should().Contain(CustomWebApplicationFactory.ProjectAId);
    }

    [Fact]
    public async Task GetMe_WhenUnauthenticated_Returns401Unauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task HealthEndpoint_Returns200Healthy()
    {
        // Act
        var response = await _client.GetAsync("/healthz");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Healthy");
    }
}
