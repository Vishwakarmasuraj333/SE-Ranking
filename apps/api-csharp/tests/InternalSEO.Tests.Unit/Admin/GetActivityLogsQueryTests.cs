using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.TestHelper;
using InternalSEO.Application.Features.ActivityLogs.Queries;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Unit.Common;
using Xunit;

namespace InternalSEO.Tests.Unit.Admin;

public class GetActivityLogsQueryTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetActivityLogsQueryValidator _validator;

    public GetActivityLogsQueryTests()
    {
        _context = TestDbContextFactory.Create();
        _validator = new GetActivityLogsQueryValidator();
    }

    [Fact]
    public void Validator_ValidQuery_PassesValidation()
    {
        var query = new GetActivityLogsQuery(
            PageNumber: 1,
            PageSize: 20,
            FromUtc: DateTimeOffset.UtcNow.AddDays(-7),
            ToUtc: DateTimeOffset.UtcNow);

        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validator_InvalidPageNumber_FailsValidation(int pageNumber)
    {
        var query = new GetActivityLogsQuery(PageNumber: pageNumber, PageSize: 20);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.PageNumber);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]
    [InlineData(-5)]
    public void Validator_InvalidPageSize_FailsValidation(int pageSize)
    {
        var query = new GetActivityLogsQuery(PageNumber: 1, PageSize: pageSize);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.PageSize);
    }

    [Fact]
    public void Validator_ToUtcBeforeFromUtc_FailsValidation()
    {
        var query = new GetActivityLogsQuery(
            PageNumber: 1,
            PageSize: 20,
            FromUtc: DateTimeOffset.UtcNow,
            ToUtc: DateTimeOffset.UtcNow.AddDays(-1));

        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.ToUtc);
    }

    [Fact]
    public async Task Handler_NoFilters_ReturnsNewestFirstPaginatedResults()
    {
        var project = new Project { Id = Guid.NewGuid(), Name = "Alpha Project", PrimaryDomain = "alpha.com" };
        _context.Projects.Add(project);

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 101, ActionType = "Project.Created", EntityType = "Project", EntityId = "1", CreatedAt = DateTimeOffset.UtcNow.AddHours(-3), Project = project, ProjectId = project.Id },
            new ActivityLog { Id = 102, ActionType = "Keyword.Created", EntityType = "Keyword", EntityId = "2", CreatedAt = DateTimeOffset.UtcNow.AddHours(-1), Project = project, ProjectId = project.Id },
            new ActivityLog { Id = 103, ActionType = "Task.Created", EntityType = "Task", EntityId = "3", CreatedAt = DateTimeOffset.UtcNow.AddHours(-2), Project = null, ProjectId = null }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(PageNumber: 1, PageSize: 2), CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
        Assert.Equal(2, result.TotalPages);
        Assert.Equal(2, result.Items.Count);
        Assert.True(result.HasNextPage);
        Assert.False(result.HasPreviousPage);

        // Newest first order check: Id 102 (-1h), then Id 103 (-2h)
        var itemsList = result.Items.ToList();
        Assert.Equal(102, itemsList[0].Id);
        Assert.Equal("Alpha Project", itemsList[0].ProjectName);
        Assert.Equal(103, itemsList[1].Id);
        Assert.Null(itemsList[1].ProjectName); // global log has null project
    }

    [Fact]
    public async Task Handler_ProjectIdFilter_FiltersCorrectly()
    {
        var proj1 = Guid.NewGuid();
        var proj2 = Guid.NewGuid();

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 201, ProjectId = proj1, CreatedAt = DateTimeOffset.UtcNow },
            new ActivityLog { Id = 202, ProjectId = proj2, CreatedAt = DateTimeOffset.UtcNow },
            new ActivityLog { Id = 203, ProjectId = null, CreatedAt = DateTimeOffset.UtcNow }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(ProjectId: proj1), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(201, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_ActorIdFilter_FiltersCorrectly()
    {
        var actor1 = Guid.NewGuid();
        var actor2 = Guid.NewGuid();

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 301, ActorId = actor1, CreatedAt = DateTimeOffset.UtcNow },
            new ActivityLog { Id = 302, ActorId = actor2, CreatedAt = DateTimeOffset.UtcNow }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(ActorId: actor2), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(302, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_EntityTypeAndActionTypeFilters_FiltersCorrectly()
    {
        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 401, EntityType = "Project", ActionType = "Project.Created", CreatedAt = DateTimeOffset.UtcNow },
            new ActivityLog { Id = 402, EntityType = "Task", ActionType = "Task.Created", CreatedAt = DateTimeOffset.UtcNow },
            new ActivityLog { Id = 403, EntityType = "Task", ActionType = "Task.StatusUpdated", CreatedAt = DateTimeOffset.UtcNow }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(EntityType: "Task", ActionType: "Task.StatusUpdated"), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(403, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_DateRangeFilter_FiltersCorrectly()
    {
        var baseDate = DateTimeOffset.UtcNow;

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 501, CreatedAt = baseDate.AddDays(-10) },
            new ActivityLog { Id = 502, CreatedAt = baseDate.AddDays(-5) },
            new ActivityLog { Id = 503, CreatedAt = baseDate.AddDays(-1) }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(
            FromUtc: baseDate.AddDays(-6),
            ToUtc: baseDate.AddDays(-2)), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(502, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_FromUtcOnlyFilter_FiltersCorrectly()
    {
        var baseDate = DateTimeOffset.UtcNow;

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 601, CreatedAt = baseDate.AddDays(-10) },
            new ActivityLog { Id = 602, CreatedAt = baseDate.AddDays(-2) }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(
            FromUtc: baseDate.AddDays(-5)), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(602, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_ToUtcOnlyFilter_FiltersCorrectly()
    {
        var baseDate = DateTimeOffset.UtcNow;

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 701, CreatedAt = baseDate.AddDays(-10) },
            new ActivityLog { Id = 702, CreatedAt = baseDate.AddDays(-2) }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(
            ToUtc: baseDate.AddDays(-5)), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(701, result.Items.First().Id);
    }

    [Fact]
    public async Task Handler_CombinedFilters_FiltersCorrectly()
    {
        var proj1 = Guid.NewGuid();
        var proj2 = Guid.NewGuid();
        var actor1 = Guid.NewGuid();
        var actor2 = Guid.NewGuid();
        var baseDate = DateTimeOffset.UtcNow;

        _context.ActivityLogs.AddRange(
            new ActivityLog { Id = 801, ProjectId = proj1, ActorId = actor1, EntityType = "Task", ActionType = "Task.Created", CreatedAt = baseDate.AddDays(-2) },
            new ActivityLog { Id = 802, ProjectId = proj1, ActorId = actor1, EntityType = "Task", ActionType = "Task.Updated", CreatedAt = baseDate.AddDays(-2) },
            new ActivityLog { Id = 803, ProjectId = proj1, ActorId = actor2, EntityType = "Task", ActionType = "Task.Created", CreatedAt = baseDate.AddDays(-2) },
            new ActivityLog { Id = 804, ProjectId = proj2, ActorId = actor1, EntityType = "Task", ActionType = "Task.Created", CreatedAt = baseDate.AddDays(-2) },
            new ActivityLog { Id = 805, ProjectId = proj1, ActorId = actor1, EntityType = "Task", ActionType = "Task.Created", CreatedAt = baseDate.AddDays(-10) }
        );
        await _context.SaveChangesAsync();

        var handler = new GetActivityLogsQueryHandler(_context);
        var result = await handler.Handle(new GetActivityLogsQuery(
            ProjectId: proj1,
            ActorId: actor1,
            EntityType: "Task",
            ActionType: "Task.Created",
            FromUtc: baseDate.AddDays(-5),
            ToUtc: baseDate.AddDays(1)), CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(801, result.Items.First().Id);
    }
}
