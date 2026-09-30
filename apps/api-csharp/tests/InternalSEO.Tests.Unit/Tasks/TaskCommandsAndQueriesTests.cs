using FluentAssertions;
using InternalSEO.Application.Common.Exceptions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Features.Tasks.Commands.AddComment;
using InternalSEO.Application.Features.Tasks.Commands.CreateTask;
using InternalSEO.Application.Features.Tasks.Commands.EnqueueVerification;
using InternalSEO.Application.Features.Tasks.Commands.PatchTaskStatus;
using InternalSEO.Application.Features.Tasks.Commands.UpdateTask;
using InternalSEO.Application.Features.Tasks.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace InternalSEO.Tests.Unit.Tasks;

public class TaskCommandsAndQueriesTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IActivityLogger> _activityLoggerMock = new();
    private readonly Mock<ITaskVerificationEnqueuer> _enqueuerMock = new();
    private readonly Mock<INotificationService> _notificationServiceMock = new();

    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _nonMemberUserId = Guid.NewGuid();

    public TaskCommandsAndQueriesTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        _currentUserServiceMock.Setup(u => u.UserId).Returns(_userId);
        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);

        // Seed Project & Member
        var project = new Project
        {
            Id = _projectId,
            Name = "Test Project",
            PrimaryDomain = "company.com",
            CreatedBy = _userId
        };
        _context.Projects.Add(project);

        var member = new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            UserId = _userId,
            AccessLevel = Domain.Enums.ProjectAccessLevel.Member
        };
        _context.ProjectMembers.Add(member);

        _context.SaveChanges();
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_CreatesTaskSuccessfully()
    {
        var handler = new CreateTaskCommandHandler(_context, _currentUserServiceMock.Object, _activityLoggerMock.Object, _notificationServiceMock.Object);

        var command = new CreateTaskCommand(
            ProjectId: _projectId,
            Title: "Fix 404 Error",
            Description: "Resolve missing landing page",
            AffectedUrl: "https://company.com/landing",
            Priority: "High",
            AssigneeId: _userId,
            DueDate: new DateOnly(2026, 10, 1),
            AcceptanceCriteria: "Page returns HTTP 200"
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await _context.Tasks.FindAsync(result.Data);
        created.Should().NotBeNull();
        created!.Title.Should().Be("Fix 404 Error");
        created.Status.Should().Be("Assigned");
        created.Priority.Should().Be("High");
        created.AssigneeId.Should().Be(_userId);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_ThrowsBadRequest_WhenAssigneeIsNotProjectMember()
    {
        var handler = new CreateTaskCommandHandler(_context, _currentUserServiceMock.Object, _activityLoggerMock.Object, _notificationServiceMock.Object);

        var command = new CreateTaskCommand(
            ProjectId: _projectId,
            Title: "Fix Title Tag",
            AssigneeId: _nonMemberUserId
        );

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("*not an authorized member*");
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_PopulatesFromSourceIssue_WhenIssueIdProvided()
    {
        var crawlRunId = Guid.NewGuid();
        var rule = new AuditRule { Id = "RULE-TITLE-MISSING", Title = "Missing Title", Category = "Content", Recommendation = "Add <title> tag" };
        _context.AuditRules.Add(rule);

        var issue = new AuditIssue
        {
            Id = Guid.NewGuid(),
            CrawlRunId = crawlRunId,
            ProjectId = _projectId,
            RuleCode = "RULE-TITLE-MISSING",
            Severity = "Error",
            AffectedUrl = "https://company.com/services",
            AffectedUrlHash = "hash123",
            Status = "Open"
        };
        _context.AuditIssues.Add(issue);
        await _context.SaveChangesAsync();

        var handler = new CreateTaskCommandHandler(_context, _currentUserServiceMock.Object, _activityLoggerMock.Object, _notificationServiceMock.Object);

        var command = new CreateTaskCommand(
            ProjectId: _projectId,
            Title: "Add Missing Title to Services",
            SourceIssueId: issue.Id
        );

        var result = await handler.Handle(command, CancellationToken.None);

        var created = await _context.Tasks.FindAsync(result.Data);
        created.Should().NotBeNull();
        created!.SourceIssueId.Should().Be(issue.Id);
        created.AffectedUrl.Should().Be("https://company.com/services");
        created.AcceptanceCriteria.Should().Contain("RULE-TITLE-MISSING");
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateTask_UpdatesFieldsSuccessfully()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Initial Title",
            Priority = "Low",
            Status = "Open",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var handler = new UpdateTaskCommandHandler(_context, _activityLoggerMock.Object, _notificationServiceMock.Object);

        var command = new UpdateTaskCommand(
            ProjectId: _projectId,
            TaskId: task.Id,
            Title: "Updated Title",
            Description: "New description",
            Priority: "Critical",
            AssigneeId: _userId,
            DueDate: new DateOnly(2026, 11, 15),
            AcceptanceCriteria: "Criteria 1"
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeTrue();
        var updated = await _context.Tasks.FindAsync(task.Id);
        updated!.Title.Should().Be("Updated Title");
        updated.Priority.Should().Be("Critical");
        updated.AssigneeId.Should().Be(_userId);
        updated.Status.Should().Be("Assigned");
    }

    [Fact]
    public async System.Threading.Tasks.Task PatchTaskStatus_EnforcesValidTransitions()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Task For Transition",
            Status = "Open",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var handler = new PatchTaskStatusCommandHandler(_context, _activityLoggerMock.Object);

        // 1. Open -> InProgress (Valid)
        var res1 = await handler.Handle(new PatchTaskStatusCommand(_projectId, task.Id, "InProgress"), CancellationToken.None);
        res1.Success.Should().BeTrue();
        (await _context.Tasks.FindAsync(task.Id))!.Status.Should().Be("InProgress");

        // 2. InProgress -> Blocked (Valid)
        var res2 = await handler.Handle(new PatchTaskStatusCommand(_projectId, task.Id, "Blocked"), CancellationToken.None);
        res2.Success.Should().BeTrue();
        (await _context.Tasks.FindAsync(task.Id))!.Status.Should().Be("Blocked");

        // 3. Blocked -> InProgress (Valid)
        var res3 = await handler.Handle(new PatchTaskStatusCommand(_projectId, task.Id, "InProgress"), CancellationToken.None);
        res3.Success.Should().BeTrue();

        // 4. InProgress -> Directly Verified (INVALID - must be blocked)
        var act = () => handler.Handle(new PatchTaskStatusCommand(_projectId, task.Id, "Verified"), CancellationToken.None);
        await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("*cannot be directly changed to 'Verified'*");
    }

    [Fact]
    public async System.Threading.Tasks.Task EnqueueTaskVerification_TransitionsToReadyForVerificationAndQueuesJob()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Task to Verify",
            AffectedUrl = "https://company.com/page",
            Status = "InProgress",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var handler = new EnqueueTaskVerificationCommandHandler(_context, _enqueuerMock.Object, _currentUserServiceMock.Object, _activityLoggerMock.Object);

        var result = await handler.Handle(new EnqueueTaskVerificationCommand(_projectId, task.Id), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Status.Should().Be("Queued");

        var updatedTask = await _context.Tasks.FindAsync(task.Id);
        updatedTask!.Status.Should().Be("ReadyForVerification");

        var verifications = await _context.TaskVerifications.Where(v => v.TaskId == task.Id).ToListAsync();
        verifications.Should().HaveCount(1);
        verifications[0].Status.Should().Be("Queued");

        _enqueuerMock.Verify(e => e.EnqueueVerificationJob(verifications[0].Id), Times.Once);
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_CreatesCommentAndLogsActivity()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Task For Comment",
            Status = "Open",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);

        var user = new User
        {
            Id = _userId,
            Email = "user@example.com",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hash",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var handler = new AddTaskCommentCommandHandler(_context, _currentUserServiceMock.Object, _activityLoggerMock.Object);

        var result = await handler.Handle(new AddTaskCommentCommand(_projectId, task.Id, "This is a verification note."), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.CommentText.Should().Be("This is a verification note.");
        result.Data.AuthorName.Should().Be("Test User");
        result.Data.AuthorEmail.Should().Be("user@example.com");

        var comments = await _context.TaskComments.Where(c => c.TaskId == task.Id).ToListAsync();
        comments.Should().HaveCount(1);
        comments[0].CommentText.Should().Be("This is a verification note.");

        _activityLoggerMock.Verify(a => a.LogAsync(
            "Task.CommentAdded",
            "Task",
            task.Id.ToString(),
            _projectId,
            It.IsAny<object>(),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_ThrowsNotFound_WhenTaskBelongsToDifferentProject()
    {
        var otherProjectId = Guid.NewGuid();
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = otherProjectId,
            Title = "Other Project Task",
            Status = "Open",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var handler = new AddTaskCommentCommandHandler(_context, _currentUserServiceMock.Object, _activityLoggerMock.Object);

        var act = () => handler.Handle(new AddTaskCommentCommand(_projectId, task.Id, "Comment on other project task"), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTaskComments_ReturnsCommentsInChronologicalOrder()
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            ProjectId = _projectId,
            Title = "Task With Comments",
            Status = "Open",
            CreatedBy = _userId
        };
        _context.Tasks.Add(task);

        var user = new User
        {
            Id = _userId,
            Email = "user@example.com",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "hash",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Users.Add(user);

        var c1 = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskId = task.Id,
            UserId = _userId,
            CommentText = "First Comment",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        };
        var c2 = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskId = task.Id,
            UserId = _userId,
            CommentText = "Second Comment",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
        };
        _context.TaskComments.AddRange(c1, c2);
        await _context.SaveChangesAsync();

        var handler = new GetTaskCommentsQueryHandler(_context);

        var result = await handler.Handle(new GetTaskCommentsQuery(_projectId, task.Id), CancellationToken.None);

        result.Success.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].CommentText.Should().Be("First Comment");
        result.Data[1].CommentText.Should().Be("Second Comment");
    }
}
