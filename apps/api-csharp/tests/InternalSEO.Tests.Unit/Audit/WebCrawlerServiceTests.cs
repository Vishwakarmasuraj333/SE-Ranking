using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Audit;

public class WebCrawlerServiceTests
{
    private readonly Mock<ISsrfValidator> _mockSsrf = new();
    private readonly Mock<IUrlNormalizer> _mockNormalizer = new();

    [Fact]
    public async Task CrawlWebsiteAsync_ThrowsCrawlValidationException_WhenStartUrlRejectedBySsrf()
    {
        var startUri = new Uri("http://localhost/admin");
        _mockSsrf.Setup(s => s.ValidateUrlAsync(startUri, "company.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((false, "Access to restricted host 'localhost' is blocked."));

        var service = new WebCrawlerService(_mockSsrf.Object, _mockNormalizer.Object, NullLogger<WebCrawlerService>.Instance);

        var act = () => service.CrawlWebsiteAsync(startUri, "company.com", 10, 2, 0, "testbot");

        await act.Should().ThrowAsync<CrawlValidationException>()
            .WithMessage("*rejected by security validator*");
    }

    [Fact]
    public async Task CrawlWebsiteAsync_ThrowsCrawlValidationException_WhenStartUrlFailsDnsOrConnection()
    {
        var startUri = new Uri("https://unreachable-test-domain-xyz-404.nonexistent/");
        _mockSsrf.Setup(s => s.ValidateUrlAsync(startUri, "unreachable-test-domain-xyz-404.nonexistent", It.IsAny<CancellationToken>()))
            .ReturnsAsync((true, (string?)null));
        _mockNormalizer.Setup(n => n.Normalize(startUri)).Returns(startUri.AbsoluteUri);

        var service = new WebCrawlerService(_mockSsrf.Object, _mockNormalizer.Object, NullLogger<WebCrawlerService>.Instance);

        var act = () => service.CrawlWebsiteAsync(startUri, "unreachable-test-domain-xyz-404.nonexistent", 10, 2, 0, "testbot");

        await act.Should().ThrowAsync<CrawlValidationException>()
            .WithMessage("*Failed to reach start URL*");
    }
}
