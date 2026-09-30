using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Users.Commands;
using InternalSEO.Application.Features.Users.DTOs;
using InternalSEO.Application.Features.Users.Queries;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Users;

public class AdminUserFeaturesTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IPasswordHasherService> _passwordHasherMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();

    private readonly Guid _adminUserId = Guid.NewGuid();
    private readonly Guid _executiveUserId = Guid.NewGuid();
    private readonly Guid _projectId = Guid.NewGuid();

    public AdminUserFeaturesTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        _currentUserServiceMock.Setup(u => u.UserId).Returns(_adminUserId);
        _currentUserServiceMock.Setup(u => u.IsSuperAdmin).Returns(true);
        _currentUserServiceMock.Setup(u => u.Role).Returns(SystemRoles.SuperAdmin);

        _passwordHasherMock.Setup(p => p.HashPassword(It.IsAny<User>(), It.IsAny<string>()))
            .Returns("hashed_pw_123");

        // Seed Roles
        var adminRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SuperAdmin, NormalizedName = SystemRoles.SuperAdmin.ToUpperInvariant() };
        var execRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SEOExecutive, NormalizedName = SystemRoles.SEOExecutive.ToUpperInvariant() };
        var viewerRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.Viewer, NormalizedName = SystemRoles.Viewer.ToUpperInvariant() };

        _context.Roles.AddRange(adminRole, execRole, viewerRole);

        // Seed Admin User
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@internal-seo.local",
            NormalizedEmail = "ADMIN@INTERNAL-SEO.LOCAL",
            FirstName = "Super",
            LastName = "Admin",
            IsActive = true
        };
        _context.Users.Add(adminUser);
        _context.UserRoles.Add(new UserRole { UserId = _adminUserId, RoleId = adminRole.Id });

        // Seed Executive User
        var execUser = new User
        {
            Id = _executiveUserId,
            Email = "exec@internal-seo.local",
            NormalizedEmail = "EXEC@INTERNAL-SEO.LOCAL",
            FirstName = "SEO",
            LastName = "Specialist",
            IsActive = true
        };
        _context.Users.Add(execUser);
        _context.UserRoles.Add(new UserRole { UserId = _executiveUserId, RoleId = execRole.Id });

        // Seed Project
        var project = new Project
        {
            Id = _projectId,
            Name = "Acme Portal",
            PrimaryDomain = "acme.com",
            CreatedBy = _adminUserId
        };
        _context.Projects.Add(project);

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAdminUsersQuery_Returns_Paginated_Users()
    {
        var handler = new GetAdminUsersQueryHandler(_context);
        var result = await handler.Handle(new GetAdminUsersQuery(), CancellationToken.None);

        result.Should().NotBeNull();
        result.TotalCount.Should().Be(2);
        result.Items.Should().Contain(u => u.Email == "admin@internal-seo.local");
        result.Items.Should().Contain(u => u.Email == "exec@internal-seo.local");
    }

    [Fact]
    public async Task GetAdminUsersQuery_WithSearchFilter_FiltersCorrectly()
    {
        var handler = new GetAdminUsersQueryHandler(_context);
        var result = await handler.Handle(new GetAdminUsersQuery(Search: "Specialist"), CancellationToken.None);

        result.Should().NotBeNull();
        result.TotalCount.Should().Be(1);
        result.Items.First().Email.Should().Be("exec@internal-seo.local");
    }

    [Fact]
    public async Task GetAdminUserDetailQuery_Returns_User_With_ProjectMemberships()
    {
        // Add project membership
        _context.ProjectMembers.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            UserId = _executiveUserId,
            AccessLevel = ProjectAccessLevel.Member
        });
        await _context.SaveChangesAsync();

        var handler = new GetAdminUserDetailQueryHandler(_context);
        var result = await handler.Handle(new GetAdminUserDetailQuery(_executiveUserId), CancellationToken.None);

        result.Should().NotBeNull();
        result.Email.Should().Be("exec@internal-seo.local");
        result.Role.Should().Be(SystemRoles.SEOExecutive);
        result.ProjectMemberships.Should().HaveCount(1);
        result.ProjectMemberships.First().ProjectName.Should().Be("Acme Portal");
    }

    [Fact]
    public async Task CreateAdminUserCommand_Creates_NewUser_And_AssignsRole()
    {
        var handler = new CreateAdminUserCommandHandler(
            _context,
            _passwordHasherMock.Object,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new CreateAdminUserCommand(
            Email: "newviewer@internal-seo.local",
            Password: "SecurePassword123!",
            FirstName: "New",
            LastName: "Viewer",
            Role: SystemRoles.Viewer);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Email.Should().Be("newviewer@internal-seo.local");
        result.Role.Should().Be(SystemRoles.Viewer);
        result.IsActive.Should().BeTrue();

        var dbUser = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == "newviewer@internal-seo.local");
        dbUser.Should().NotBeNull();
        dbUser!.UserRoles.Should().ContainSingle(ur => ur.Role.Name == SystemRoles.Viewer);
    }

    [Fact]
    public async Task CreateAdminUserCommand_DuplicateEmail_ThrowsValidationException()
    {
        var handler = new CreateAdminUserCommandHandler(
            _context,
            _passwordHasherMock.Object,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new CreateAdminUserCommand(
            Email: "admin@internal-seo.local",
            Password: "SecurePassword123!",
            FirstName: "Dup",
            LastName: "Admin",
            Role: SystemRoles.SuperAdmin);

        Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task UpdateUserRoleCommand_Changes_User_Role()
    {
        var handler = new UpdateUserRoleCommandHandler(
            _context,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new UpdateUserRoleCommand(_executiveUserId, SystemRoles.Viewer);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Role.Should().Be(SystemRoles.Viewer);

        var dbUserRole = await _context.UserRoles.Include(ur => ur.Role).FirstOrDefaultAsync(ur => ur.UserId == _executiveUserId);
        dbUserRole!.Role.Name.Should().Be(SystemRoles.Viewer);
    }

    [Fact]
    public async Task UpdateUserStatusCommand_Can_Deactivate_User()
    {
        var handler = new UpdateUserStatusCommandHandler(
            _context,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new UpdateUserStatusCommand(_executiveUserId, false);
        var result = await handler.Handle(command, CancellationToken.None);

        result.IsActive.Should().BeFalse();

        var dbUser = await _context.Users.FindAsync(_executiveUserId);
        dbUser!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateUserStatusCommand_SelfDeactivation_ThrowsValidationException()
    {
        var handler = new UpdateUserStatusCommandHandler(
            _context,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new UpdateUserStatusCommand(_adminUserId, false);

        Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task AssignUserProjectCommand_Assigns_User_To_Project()
    {
        var handler = new AssignUserProjectCommandHandler(
            _context,
            _activityLoggerMock.Object,
            _currentUserServiceMock.Object);

        var command = new AssignUserProjectCommand(_executiveUserId, _projectId, ProjectAccessLevel.Owner);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.ProjectId.Should().Be(_projectId);
        result.AccessLevel.Should().Be(ProjectAccessLevel.Owner);

        var membership = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.UserId == _executiveUserId && pm.ProjectId == _projectId);
        membership.Should().NotBeNull();
        membership!.AccessLevel.Should().Be(ProjectAccessLevel.Owner);
    }

    [Fact]
    public async Task UnassignUserProjectCommand_Removes_User_From_Project()
    {
        _context.ProjectMembers.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            UserId = _executiveUserId,
            AccessLevel = ProjectAccessLevel.Member
        });
        await _context.SaveChangesAsync();

        var handler = new UnassignUserProjectCommandHandler(_context, _activityLoggerMock.Object);
        var result = await handler.Handle(new UnassignUserProjectCommand(_executiveUserId, _projectId), CancellationToken.None);

        result.Should().BeTrue();

        var membership = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.UserId == _executiveUserId && pm.ProjectId == _projectId);
        membership.Should().BeNull();
    }
}
