using FluentAssertions;
using InternalSEO.Application.Features.GoogleAnalytics.Commands;
using InternalSEO.Application.Features.GoogleAnalytics.Queries;
using Xunit;

namespace InternalSEO.Tests.Unit;

public class Ga4ValidationTests
{
    [Fact]
    public void BindGa4PropertyCommandValidator_WithValidData_PassesValidation()
    {
        var validator = new BindGa4PropertyCommandValidator();
        var command = new BindGa4PropertyCommand(Guid.NewGuid(), "properties/123456789");

        var result = validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void BindGa4PropertyCommandValidator_WithEmptyProperty_FailsValidation(string? property)
    {
        var validator = new BindGa4PropertyCommandValidator();
        var command = new BindGa4PropertyCommand(Guid.NewGuid(), property!);

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PropertyIdentifier");
    }

    [Fact]
    public void CompleteGa4OAuthCallbackCommandValidator_WithValidData_PassesValidation()
    {
        var validator = new CompleteGa4OAuthCallbackCommandValidator();
        var command = new CompleteGa4OAuthCallbackCommand(Guid.NewGuid(), "4/0AeoMockCode", "https://example.com/callback", "state123");

        var result = validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CompleteGa4OAuthCallbackCommandValidator_WithEmptyCode_FailsValidation()
    {
        var validator = new CompleteGa4OAuthCallbackCommandValidator();
        var command = new CompleteGa4OAuthCallbackCommand(Guid.NewGuid(), "", "https://example.com/callback", "state123");

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Code");
    }

    [Fact]
    public void CompleteGa4OAuthCallbackCommandValidator_WithEmptyState_FailsValidation()
    {
        var validator = new CompleteGa4OAuthCallbackCommandValidator();
        var command = new CompleteGa4OAuthCallbackCommand(Guid.NewGuid(), "valid_code", "https://example.com/callback", "");

        var result = validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "State");
    }

    [Fact]
    public void GetGa4PagesQueryValidator_WithInvalidDateRange_FailsValidation()
    {
        var validator = new GetGa4PagesQueryValidator();
        var query = new GetGa4PagesQuery(
            Guid.NewGuid(),
            StartDate: new DateOnly(2026, 9, 10),
            EndDate: new DateOnly(2026, 9, 1)
        );

        var result = validator.Validate(query);
        result.IsValid.Should().BeFalse();
    }
}
