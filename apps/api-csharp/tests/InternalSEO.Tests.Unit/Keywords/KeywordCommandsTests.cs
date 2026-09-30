using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Keywords.Commands.BulkCreateKeywords;
using InternalSEO.Application.Features.Keywords.Commands.CreateKeyword;
using InternalSEO.Application.Features.Keywords.DTOs;
using InternalSEO.Domain.Entities;
using InternalSEO.Tests.Unit.Common;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Keywords;

public class KeywordCommandsTests
{
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();

    [Fact]
    public async Task CreateKeyword_ValidRequest_CreatesKeywordAndTags()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.UserId).Returns(userId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "SEO Project",
            PrimaryDomain = "seo.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        var group = new KeywordGroup
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Name = "Core"
        };
        context.KeywordGroups.Add(group);
        await context.SaveChangesAsync();

        var handler = new CreateKeywordCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new CreateKeywordCommand
        {
            ProjectId = project.Id,
            GroupId = group.Id,
            KeywordText = "best seo platform",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop",
            TargetUrl = "https://seo.example.com/platform",
            SearchIntent = "Commercial",
            Tags = new List<string> { "high-priority", "tier1" }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.KeywordText.Should().Be("best seo platform");
        result.GroupId.Should().Be(group.Id);
        result.GroupName.Should().Be("Core");
        result.Tags.Should().Contain(new[] { "high-priority", "tier1" });
        result.IsActive.Should().BeTrue();

        var dbKeyword = await context.Keywords
            .Include(k => k.KeywordTags)
            .ThenInclude(kt => kt.Tag)
            .FirstOrDefaultAsync(k => k.Id == result.Id);

        dbKeyword.Should().NotBeNull();
        dbKeyword!.KeywordTags.Should().HaveCount(2);

        _activityLoggerMock.Verify(x => x.LogAsync(
            "Keyword.Created",
            "Keyword",
            result.Id.ToString(),
            project.Id,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateKeyword_DuplicateKeyword_ThrowsValidationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.UserId).Returns(userId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Duplicate Test",
            PrimaryDomain = "dup.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        context.Keywords.Add(new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            KeywordText = "duplicate keyword",
            NormalizedText = "duplicate keyword",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop",
            CreatedBy = userId
        });
        await context.SaveChangesAsync();

        var handler = new CreateKeywordCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new CreateKeywordCommand
        {
            ProjectId = project.Id,
            KeywordText = "DUPLICATE KEYWORD",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task BulkCreateKeywords_ImportsValidAndSkipsDuplicates()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.UserId).Returns(userId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Bulk Test",
            PrimaryDomain = "bulk.example.com",
            CreatedBy = userId
        };
        context.Projects.Add(project);

        context.Keywords.Add(new Keyword
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            KeywordText = "already exists",
            NormalizedText = "already exists",
            SearchEngine = "google",
            CountryCode = "US",
            Device = "desktop",
            CreatedBy = userId
        });
        await context.SaveChangesAsync();

        var handler = new BulkCreateKeywordsCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new BulkCreateKeywordsCommand
        {
            ProjectId = project.Id,
            Rows = new List<ImportKeywordRow>
            {
                new() { Keyword = "already exists", SearchEngine = "google", Country = "US", Device = "desktop" },
                new() { Keyword = "fresh new keyword", SearchEngine = "google", Country = "US", Device = "desktop", Group = "NewGroup" },
                new() { Keyword = "", SearchEngine = "google" } // invalid empty
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.TotalProcessed.Should().Be(3);
        result.ImportedCount.Should().Be(1);
        result.SkippedDuplicatesCount.Should().Be(1);
        result.FailedCount.Should().Be(1);
        result.Errors.Should().ContainSingle(e => e.Contains("empty"));

        // Verify "NewGroup" was created
        var group = await context.KeywordGroups.FirstOrDefaultAsync(g => g.Name == "NewGroup" && g.ProjectId == project.Id);
        group.Should().NotBeNull();
    }
}
