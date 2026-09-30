using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Tasks.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Tasks;

public class TaskEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TaskEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedTaskData();
    }

    private void SeedTaskData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!db.Tasks.Any(t => t.ProjectId == CustomWebApplicationFactory.ProjectAId))
        {
            var task1 = new TaskItem
            {
                Id = Guid.NewGuid(),
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                Title = "Fix Broken Title",
                Description = "Title tag is missing on homepage",
                AffectedUrl = "https://alpha.company.com/",
                Priority = "High",
                Status = "Open",
                AssigneeId = CustomWebApplicationFactory.SeoUserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            db.Tasks.Add(task1);
            db.SaveChanges();
        }
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasks_AsProjectMember_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedList<TaskDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasks_Unauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTasks_NonMember_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Project B is not assigned to SeoUserId
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_AsSeoExecutive_ReturnsCreated()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        var request = new CreateTaskRequest(
            Title: "Add missing meta description",
            Description: "Meta description missing on product page",
            AffectedUrl: "https://alpha.company.com/product-1",
            Priority: "Medium",
            AssigneeId: CustomWebApplicationFactory.SeoUserId,
            DueDate: new DateOnly(2026, 12, 31),
            AcceptanceCriteria: "Meta description present with > 50 chars",
            SourceIssueId: null
        );

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateTask_AsViewer_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");

        var request = new CreateTaskRequest(
            Title: "Viewer attempt",
            Description: null,
            AffectedUrl: null,
            Priority: "Low",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task PatchStatus_DirectlyToVerified_ReturnsBadRequest()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Create a task first
        var createRequest = new CreateTaskRequest(
            Title: "Task for status test",
            Description: "Test description",
            AffectedUrl: null,
            Priority: "Medium",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );
        var createRes = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", createRequest);
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        // Try to patch directly to Verified
        var patchRequest = new PatchTaskStatusRequest("Verified");
        var patchRes = await client.PatchAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/status", patchRequest);

        patchRes.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async System.Threading.Tasks.Task VerifyTask_AsSeoExecutive_ReturnsAccepted()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // Create a task first
        var createRequest = new CreateTaskRequest(
            Title: "Task to verify",
            Description: "Verify flow",
            AffectedUrl: "https://alpha.company.com/test-verify",
            Priority: "High",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );
        var createRes = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", createRequest);
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        // Verify task
        var verifyRes = await client.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/verify", null);

        verifyRes.StatusCode.Should().Be(HttpStatusCode.Accepted);
        var result = await verifyRes.Content.ReadFromJsonAsync<ApiResponse<TaskVerificationDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.Status.Should().Be("Queued");
    }

    [Fact]
    public async System.Threading.Tasks.Task VerifyTask_AsViewer_ReturnsForbidden()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var createRequest = new CreateTaskRequest(
            Title: "Task viewer cannot verify",
            Description: "Should be forbidden",
            AffectedUrl: null,
            Priority: "High",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );
        var createRes = await adminClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", createRequest);
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        var viewerClient = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var verifyRes = await viewerClient.PostAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/verify", null);

        verifyRes.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_AsProjectWriter_ReturnsCreated()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // 1. Create a task
        var createRequest = new CreateTaskRequest(
            Title: "Task for Comment Integration Test",
            Description: "Testing comments endpoint",
            AffectedUrl: null,
            Priority: "Medium",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );
        var createRes = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", createRequest);
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        // 2. Post Comment
        var commentReq = new AddTaskCommentRequest("Fixed the meta robots tag in production.");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/comments", commentReq);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskCommentDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data!.CommentText.Should().Be("Fixed the meta robots tag in production.");
        result.Data.AuthorEmail.Should().Be("seo@company.internal");
    }

    [Fact]
    public async System.Threading.Tasks.Task GetTaskComments_AsViewer_ReturnsOkWithComments()
    {
        var seoClient = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");

        // 1. Create a task & comment
        var createRequest = new CreateTaskRequest(
            Title: "Task for Viewer Read Comments",
            Description: null,
            AffectedUrl: null,
            Priority: "Low",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        );
        var createRes = await seoClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", createRequest);
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        await seoClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/comments", new AddTaskCommentRequest("Comment for viewer to read"));

        // 2. Read as Viewer
        var viewerClient = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await viewerClient.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/comments");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TaskCommentDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().ContainSingle(c => c.CommentText == "Comment for viewer to read");
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_AsViewer_ReturnsForbidden()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var createRes = await adminClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks", new CreateTaskRequest(
            Title: "Task for Viewer Forbidden Comment",
            Description: null,
            AffectedUrl: null,
            Priority: "Low",
            AssigneeId: null,
            DueDate: null,
            AcceptanceCriteria: null,
            SourceIssueId: null
        ));
        var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
        var taskId = created!.Data;

        var viewerClient = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var response = await viewerClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{taskId}/comments", new AddTaskCommentRequest("Viewer tries to comment"));

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_Unauthenticated_ReturnsUnauthorized()
    {
        var unauthClient = _factory.CreateClient();
        var response = await unauthClient.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/tasks/{Guid.NewGuid()}/comments", new AddTaskCommentRequest("Test comment"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async System.Threading.Tasks.Task AddTaskComment_NonMember_ReturnsForbidden()
    {
        // SeoUserId is NOT a member of ProjectB
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var response = await client.PostAsJsonAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/tasks/{Guid.NewGuid()}/comments", new AddTaskCommentRequest("Test comment"));

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
