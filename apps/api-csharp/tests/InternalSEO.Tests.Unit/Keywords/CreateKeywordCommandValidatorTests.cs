using FluentAssertions;
using InternalSEO.Application.Features.Keywords.Commands.CreateKeyword;
using Xunit;

namespace InternalSEO.Tests.Unit.Keywords;

public class CreateKeywordCommandValidatorTests
{
    private readonly CreateKeywordCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ReturnsTrue()
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = "enterprise seo platform",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop",
            TargetUrl = "https://example.com/features",
            SearchIntent = "Commercial"
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Validate_EmptyKeyword_ReturnsFalse(string? keyword)
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = keyword!,
            CountryCode = "US",
            Device = "desktop"
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.KeywordText));
    }

    [Fact]
    public void Validate_KeywordExceedsMaxLength_ReturnsFalse()
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = new string('k', 301),
            CountryCode = "US",
            Device = "desktop"
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.KeywordText));
    }

    [Theory]
    [InlineData("not-a-valid-url")]
    [InlineData("ftp://invalid-protocol.com")]
    public void Validate_InvalidTargetUrl_ReturnsFalse(string invalidUrl)
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = "test keyword",
            CountryCode = "US",
            Device = "desktop",
            TargetUrl = invalidUrl
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.TargetUrl));
    }

    [Fact]
    public void Validate_InvalidDevice_ReturnsFalse()
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = "test keyword",
            CountryCode = "US",
            Device = "smartwatch"
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.Device));
    }

    [Fact]
    public void Validate_InvalidSearchIntent_ReturnsFalse()
    {
        var command = new CreateKeywordCommand
        {
            ProjectId = Guid.NewGuid(),
            KeywordText = "test keyword",
            CountryCode = "US",
            Device = "desktop",
            SearchIntent = "RandomIntent"
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(command.SearchIntent));
    }
}
