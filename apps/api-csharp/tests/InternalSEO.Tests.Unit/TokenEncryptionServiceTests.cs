using FluentAssertions;
using InternalSEO.Infrastructure.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class TokenEncryptionServiceTests
{
    private readonly DataProtectionTokenEncryptionService _service;

    public TokenEncryptionServiceTests()
    {
        var services = new ServiceCollection();
        services.AddDataProtection();
        var sp = services.BuildServiceProvider();
        var provider = sp.GetRequiredService<IDataProtectionProvider>();
        _service = new DataProtectionTokenEncryptionService(provider);
    }

    [Fact]
    public void Encrypt_And_Decrypt_ReturnsOriginalPlainText()
    {
        var plainText = "1//04mock_google_refresh_token_very_long_and_secure_value_xyz123";
        var encrypted = _service.Encrypt(plainText);

        encrypted.Should().NotBeNullOrWhiteSpace();
        encrypted.Should().NotBe(plainText);

        var decrypted = _service.Decrypt(encrypted);
        decrypted.Should().Be(plainText);
    }

    [Fact]
    public void Encrypt_EmptyString_ReturnsEmptyString()
    {
        _service.Encrypt("").Should().BeEmpty();
        _service.Decrypt("").Should().BeEmpty();
    }

    [Fact]
    public void EncryptedValue_DoesNotContainPlaintextSecrets()
    {
        var secret = "google_super_secret_refresh_token";
        var encrypted = _service.Encrypt(secret);

        encrypted.Should().NotContain(secret);
    }
}
