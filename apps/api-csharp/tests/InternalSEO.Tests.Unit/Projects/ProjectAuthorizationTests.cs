using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Projects.Commands.UpdateProject;
using InternalSEO.Application.Features.Projects.Queries.GetProjectById;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Tests.Unit.Common;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Projects;

public class ProjectAuthorizationTests
{
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();

    [Fact]
    public async Task GetProjectById_WhenUserNotMemberAndNotSuperAdmin_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var unauthorizedUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(false);
        _currentUserMock.Setup(x => x.UserId).Returns(unauthorizedUserId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Secret Project",
            PrimaryDomain = "secret.com",
            CreatedBy = otherUserId
        };
        var creatorUser = new User
        {
            Id = otherUserId,
            Email = "other@test.com",
            NormalizedEmail = "OTHER@TEST.COM",
            FirstName = "Other",
            LastName = "User"
        };
        context.Users.Add(creatorUser);

        project.Members.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = otherUserId,
            AccessLevel = ProjectAccessLevel.Owner,
            AssignedBy = otherUserId
        });

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new GetProjectByIdQueryHandler(context, _currentUserMock.Object);

        // Act
        var act = () => handler.Handle(new GetProjectByIdQuery(project.Id), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*not authorized to view this project*");
    }

    [Fact]
    public async Task UpdateProject_WhenUserHasReadOnlyAccess_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var viewerUserId = Guid.NewGuid();
        var ownerUserId = Guid.NewGuid();

        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(false);
        _currentUserMock.Setup(x => x.UserId).Returns(viewerUserId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "ReadOnly Project",
            PrimaryDomain = "readonly.com",
            CreatedBy = ownerUserId
        };
        project.Members.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = viewerUserId,
            AccessLevel = ProjectAccessLevel.ReadOnly,
            AssignedBy = ownerUserId
        });

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new UpdateProjectCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new UpdateProjectCommand
        {
            Id = project.Id,
            Name = "Attempted Update Name",
            Status = ProjectStatus.Active
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*ReadOnly access cannot modify project*");
    }

    [Fact]
    public async Task UpdateProject_WhenUserIsMember_UpdatesSuccessfullyAndLogsActivity()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var memberUserId = Guid.NewGuid();

        _currentUserMock.Setup(x => x.IsSuperAdmin).Returns(false);
        _currentUserMock.Setup(x => x.UserId).Returns(memberUserId);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Original Name",
            PrimaryDomain = "orig.com",
            CreatedBy = memberUserId
        };
        project.Members.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = memberUserId,
            AccessLevel = ProjectAccessLevel.Member,
            AssignedBy = memberUserId
        });

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var handler = new UpdateProjectCommandHandler(context, _currentUserMock.Object, _activityLoggerMock.Object);

        var command = new UpdateProjectCommand
        {
            Id = project.Id,
            Name = "Updated Name",
            Timezone = "Europe/London",
            Status = ProjectStatus.Active
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");
        result.Timezone.Should().Be("Europe/London");

        _activityLoggerMock.Verify(x => x.LogAsync(
            "Project.Updated",
            "Project",
            project.Id.ToString(),
            project.Id,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
