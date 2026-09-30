using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.Commands.CreateProject;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Tests.Unit.Common;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Projects;

public class CreateProjectCommandTests
{
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();

    [Fact]
    public async Task CreateProject_WhenSuperAdmin_CreatesProjectAndAssignsOwner()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var adminId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(true);
        _currentUserMock.Setup(x => x.UserId).Returns(adminId);

        var handler = new CreateProjectCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new CreateProjectCommand
        {
            Name = "Acme Corp Website",
            PrimaryDomain = "https://acme.com/",
            Protocol = "https://",
            CountryCode = "US",
            LanguageCode = "en",
            Timezone = "America/New_York",
            DefaultDevice = "desktop",
            DefaultSearchEngine = "google"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Acme Corp Website");
        result.PrimaryDomain.Should().Be("acme.com"); // Normalized
        result.Status.Should().Be(ProjectStatus.Active);
        result.UserAccessLevel.Should().Be(ProjectAccessLevel.Owner.ToString());

        var dbProject = await context.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.Id == result.Id);
        dbProject.Should().NotBeNull();
        dbProject!.Members.Should().ContainSingle(m => m.UserId == adminId && m.AccessLevel == ProjectAccessLevel.Owner);

        _activityLoggerMock.Verify(x => x.LogAsync(
            "Project.Created",
            "Project",
            result.Id.ToString(),
            result.Id,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateProject_WhenNotSuperAdmin_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(false);
        _currentUserMock.Setup(x => x.UserId).Returns(Guid.NewGuid());

        var handler = new CreateProjectCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new CreateProjectCommand
        {
            Name = "NonAdmin Project",
            PrimaryDomain = "nonadmin.com"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task CreateProject_WithDuplicateDomain_ThrowsValidationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var adminId = Guid.NewGuid();
        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(true);
        _currentUserMock.Setup(x => x.UserId).Returns(adminId);

        context.Projects.Add(new Project
        {
            Id = Guid.NewGuid(),
            Name = "Existing",
            PrimaryDomain = "duplicate.com",
            CreatedBy = adminId
        });
        await context.SaveChangesAsync();

        var handler = new CreateProjectCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new CreateProjectCommand
        {
            Name = "New Duplicate",
            PrimaryDomain = "https://DUPLICATE.COM/"
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
    }
}
