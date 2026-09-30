using FluentAssertions;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Infrastructure.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class OAuthNonceServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly OAuthNonceService _nonceService;

    public OAuthNonceServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"NonceDb_{Guid.NewGuid():N}")
            .Options;

        _context = new ApplicationDbContext(options);

        var services = new ServiceCollection();
        services.AddDataProtection();
        var sp = services.BuildServiceProvider();

        _nonceService = new OAuthNonceService(
            _context, 
            sp.GetRequiredService<IDataProtectionProvider>(),
            NullLogger<OAuthNonceService>.Instance);
    }

    [Fact]
    public async Task GenerateAndStoreNonceAsync_GeneratesValidSingleUseNonce()
    {
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var state = await _nonceService.GenerateAndStoreNonceAsync(projectId, userId, "GA4");
        state.Should().NotBeNullOrWhiteSpace();

        var stored = await _context.OAuthNonces.FirstOrDefaultAsync();
        stored.Should().NotBeNull();
        stored!.ProjectId.Should().Be(projectId);
        stored.UserId.Should().Be(userId);
        stored.ServiceType.Should().Be("GA4");
        stored.ConsumedAt.Should().BeNull();
        stored.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);

        // First validation should succeed and atomically consume the nonce
        var validationResult = await _nonceService.ValidateAndConsumeNonceAsync(state, projectId, userId, "GA4");
        validationResult.Success.Should().BeTrue();

        var consumed = await _context.OAuthNonces.FirstAsync();
        consumed.ConsumedAt.Should().NotBeNull();

        // Second validation (replay attack) must fail
        var replayResult = await _nonceService.ValidateAndConsumeNonceAsync(state, projectId, userId, "GA4");
        replayResult.Success.Should().BeFalse();
        replayResult.ErrorMessage.Should().Contain("consumed");
    }

    [Fact]
    public async Task ValidateAndConsumeNonceAsync_WithTamperedState_FailsValidation()
    {
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var state = await _nonceService.GenerateAndStoreNonceAsync(projectId, userId, "GA4");
        var tamperedState = state + "tampered";

        var result = await _nonceService.ValidateAndConsumeNonceAsync(tamperedState, projectId, userId, "GA4");
        result.Success.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateAndConsumeNonceAsync_WithDifferentUserOrProject_FailsValidation()
    {
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var state = await _nonceService.GenerateAndStoreNonceAsync(projectId, userId, "GA4");

        // Wrong project
        var wrongProjectResult = await _nonceService.ValidateAndConsumeNonceAsync(state, Guid.NewGuid(), userId, "GA4");
        wrongProjectResult.Success.Should().BeFalse();

        // Wrong user
        var wrongUserResult = await _nonceService.ValidateAndConsumeNonceAsync(state, projectId, Guid.NewGuid(), "GA4");
        wrongUserResult.Success.Should().BeFalse();
    }
}
