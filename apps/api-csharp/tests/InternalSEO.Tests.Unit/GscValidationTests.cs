using FluentAssertions;
using InternalSEO.Application.Features.GoogleIntegrations.Commands;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class GscValidationTests
{
    [Fact]
    public void BindGscPropertyCommandValidator_WithValidData_PassesValidation()
    {
        var validator = new BindGscPropertyCommandValidator();
        var command = new BindGscPropertyCommand(Guid.NewGuid(), "sc-domain:example.com");

        var result = validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void BindGscPropertyCommandValidator_WithEmptyProperty_FailsValidation(string? property)
    {
        var validator = new BindGscPropertyCommandValidator();
        var command = new BindGscPropertyCommand(Guid.NewGuid(), property!);

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PropertyIdentifier");
    }

    [Fact]
    public void CompleteGscOAuthCallbackCommandValidator_WithValidData_PassesValidation()
    {
        var validator = new CompleteGscOAuthCallbackCommandValidator();
        var command = new CompleteGscOAuthCallbackCommand(Guid.NewGuid(), "4/0AeoMockCode", "https://example.com/callback", "state123");

        var result = validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CompleteGscOAuthCallbackCommandValidator_WithEmptyCode_FailsValidation()
    {
        var validator = new CompleteGscOAuthCallbackCommandValidator();
        var command = new CompleteGscOAuthCallbackCommand(Guid.NewGuid(), "", "https://example.com/callback", null);

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Code");
    }
}
