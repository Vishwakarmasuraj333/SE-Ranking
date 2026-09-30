using FluentAssertions;
using InternalSEO.Infrastructure.Services;
using Xunit;

namespace InternalSEO.Tests.Unit.Audit;

public class UrlNormalizerTests
{
    private readonly UrlNormalizer _normalizer = new();

    [Fact]
    public void Normalize_StripsFragmentsAndRedundantSlashes()
    {
        var uri = new Uri("https://company.com//features///sub//?#section-1");
        var normalized = _normalizer.Normalize(uri);

        normalized.Should().Be("https://company.com/features/sub");
    }

    [Fact]
    public void Normalize_StripsMarketingParameters_PreservesValuableParams()
    {
        var uri = new Uri("https://company.com/product?utm_source=google&utm_medium=cpc&page=2&fbclid=xyz&sort=asc");
        var normalized = _normalizer.Normalize(uri);

        normalized.Should().Be("https://company.com/product?page=2&sort=asc");
    }

    [Fact]
    public void Normalize_ResolvesRelativePathCorrectly()
    {
        var baseUri = new Uri("https://company.com/blog/article-1");
        var normalized = _normalizer.Normalize("../about", baseUri);

        normalized.Should().Be("https://company.com/about");
    }

    [Fact]
    public void ComputeSha256Hash_ProducesStableLowercaseHexString()
    {
        var url = "https://company.com/services";
        var hash1 = _normalizer.ComputeSha256Hash(url);
        var hash2 = _normalizer.ComputeSha256Hash(url);

        hash1.Should().NotBeNullOrEmpty();
        hash1.Length.Should().Be(64);
        hash1.Should().Be(hash2);
        hash1.Should().MatchRegex("^[a-f0-9]{64}$");
    }
}
