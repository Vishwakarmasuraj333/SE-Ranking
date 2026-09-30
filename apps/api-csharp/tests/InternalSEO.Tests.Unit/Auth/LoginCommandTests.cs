using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Auth.Commands.Login;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Services;
using InternalSEO.Tests.Unit.Common;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Auth;

public class LoginCommandTests
{
    private readonly PasswordHasherService _passwordHasher = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();
    private readonly ITokenService _tokenService;

    public LoginCommandTests()
    {
        var inMemoryConfig = new Dictionary<string, string?>
        {
            { "Jwt:SecretKey", "SuperSecretKeyForInternalSEOPlatformJWTTokenMustBe32BytesLong!" },
            { "Jwt:Issuer", "InternalSEOPlatform" },
            { "Jwt:Audience", "InternalSEOPlatform" },
            { "Jwt:AccessTokenExpirationMinutes", "15" },
            { "Jwt:RefreshTokenExpirationDays", "14" }
        };
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        _tokenService = new TokenService(configuration);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokensAndUserDetails()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var adminRole = context.Roles.First(r => r.Name == SystemRoles.SuperAdmin);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@test.com",
            NormalizedEmail = "ADMIN@TEST.COM",
            FirstName = "Admin",
            LastName = "User",
            IsActive = true
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, "SecurePassword123!");
        context.Users.Add(user);
        context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = adminRole.Id });
        await context.SaveChangesAsync();

        var handler = new LoginCommandHandler(context, _passwordHasher, _tokenService, _activityLoggerMock.Object);

        // Act
        var result = await handler.Handle(new LoginCommand("admin@test.com", "SecurePassword123!"), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.RefreshToken.Should().NotBeNullOrWhiteSpace();
        result.User.Email.Should().Be("admin@test.com");
        result.User.Role.Should().Be(SystemRoles.SuperAdmin);

        _activityLoggerMock.Verify(x => x.LogAsync(
            "Auth.Login",
            "User",
            user.Id.ToString(),
            null,
            It.IsAny<object>(),
            user.Id,
            user.Email,
            SystemRoles.SuperAdmin,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsUnauthorizedExceptionAndIncrementsFailedCount()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            NormalizedEmail = "USER@TEST.COM",
            FirstName = "Normal",
            LastName = "User",
            IsActive = true,
            AccessFailedCount = 0
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, "CorrectPassword!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var handler = new LoginCommandHandler(context, _passwordHasher, _tokenService, _activityLoggerMock.Object);

        // Act
        var act = () => handler.Handle(new LoginCommand("user@test.com", "WrongPassword!"), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();

        var updatedUser = await context.Users.FindAsync(user.Id);
        updatedUser!.AccessFailedCount.Should().Be(1);
    }

    [Fact]
    public async Task Login_AfterFiveFailedAttempts_LocksOutUser()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "locked@test.com",
            NormalizedEmail = "LOCKED@TEST.COM",
            FirstName = "Locked",
            LastName = "User",
            IsActive = true,
            AccessFailedCount = 4
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, "CorrectPassword!");
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var handler = new LoginCommandHandler(context, _passwordHasher, _tokenService, _activityLoggerMock.Object);

        // Act
        var act = () => handler.Handle(new LoginCommand("locked@test.com", "WrongPassword!"), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();

        var updatedUser = await context.Users.FindAsync(user.Id);
        updatedUser!.AccessFailedCount.Should().Be(5);
        updatedUser.LockoutEnd.Should().NotBeNull();
        updatedUser.LockoutEnd.Should().BeAfter(DateTimeOffset.UtcNow);
    }
}
