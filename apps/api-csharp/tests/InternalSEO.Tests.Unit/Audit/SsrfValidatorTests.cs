using FluentAssertions;
using InternalSEO.Infrastructure.Services;
using Xunit;

namespace InternalSEO.Tests.Unit.Audit;

public class SsrfValidatorTests
{
    private readonly SsrfValidator _validator = new();

    [Theory]
    [InlineData("http://localhost/admin")]
    [InlineData("http://127.0.0.1:8080/internal")]
    [InlineData("http://0.0.0.0/test")]
    [InlineData("http://169.254.169.254/latest/meta-data/")]
    [InlineData("http://metadata.google.internal/computeMetadata/v1/")]
    public async Task ValidateUrlAsync_BlocksRestrictedHosts(string url)
    {
        var uri = new Uri(url);
        var (isSafe, reason) = await _validator.ValidateUrlAsync(uri, "company.com");

        isSafe.Should().BeFalse();
        reason.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("ftp://company.com/file.txt")]
    [InlineData("file:///etc/passwd")]
    public async Task ValidateUrlAsync_RejectsNonHttpSchemes(string url)
    {
        var uri = new Uri(url);
        var (isSafe, reason) = await _validator.ValidateUrlAsync(uri, "company.com");

        isSafe.Should().BeFalse();
        reason.Should().Contain("Unsupported URL scheme");
    }

    [Theory]
    [InlineData("https://evil.com/phish")]
    [InlineData("https://not-company.com/page")]
    [InlineData("https://company.com.attacker.com/page")]
    public async Task ValidateUrlAsync_RejectsHostsOutsideDomainBoundary(string url)
    {
        var uri = new Uri(url);
        var (isSafe, reason) = await _validator.ValidateUrlAsync(uri, "company.com");

        isSafe.Should().BeFalse();
        reason.Should().Contain("outside the allowed project domain");
    }

    [Fact]
    public void IsWithinDomainBoundary_ValidatesSubdomainsAndExactDomain()
    {
        _validator.IsWithinDomainBoundary(new Uri("https://company.com/about"), "company.com").Should().BeTrue();
        _validator.IsWithinDomainBoundary(new Uri("https://blog.company.com/post-1"), "company.com").Should().BeTrue();
        _validator.IsWithinDomainBoundary(new Uri("https://portal.company.com/"), "company.com").Should().BeTrue();
        _validator.IsWithinDomainBoundary(new Uri("https://attackercompany.com/"), "company.com").Should().BeFalse();
        _validator.IsWithinDomainBoundary(new Uri("http://127.0.0.1:5055/"), "127.0.0.1:5055").Should().BeTrue();
        _validator.IsWithinDomainBoundary(new Uri("http://localhost:5055/"), "localhost:5055").Should().BeTrue();
    }

    [Fact]
    public async Task ValidateUrlAsync_AllowsConfiguredLoopbackTestHarness_WhenEnabled()
    {
        var mockConfig = new Moq.Mock<Microsoft.Extensions.Configuration.IConfiguration>();
        mockConfig.Setup(c => c["Crawler:AllowLoopbackTestHarness"]).Returns("true");
        mockConfig.Setup(c => c["Crawler:TestHarnessPort"]).Returns("5055");

        var harnessValidator = new SsrfValidator(mockConfig.Object);

        // Permitted test host
        var (isSafe, reason) = await harnessValidator.ValidateUrlAsync(new Uri("http://127.0.0.1:5055/"), "127.0.0.1:5055");
        isSafe.Should().BeTrue();
        reason.Should().BeNull();

        // Wrong port is blocked
        var (isSafeWrongPort, reasonWrongPort) = await harnessValidator.ValidateUrlAsync(new Uri("http://127.0.0.1:8080/"), "127.0.0.1:8080");
        isSafeWrongPort.Should().BeFalse();
        reasonWrongPort.Should().Contain("blocked");

        // Cloud metadata is STILL blocked
        var (isSafeMeta, reasonMeta) = await harnessValidator.ValidateUrlAsync(new Uri("http://169.254.169.254/latest"), "169.254.169.254");
        isSafeMeta.Should().BeFalse();
        reasonMeta.Should().Contain("blocked");
    }
}
