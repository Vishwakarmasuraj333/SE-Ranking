using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Reports.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Reports;

public class ReportEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ReportEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateReport_AsSuperAdmin_ReturnsCreated()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var request = new
        {
            Title = "SuperAdmin Executive Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-30),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi", "rankings", "audit", "tasks" },
            ExecutiveNotes = "Quarterly progress overview by SuperAdmin"
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be("SuperAdmin Executive Report");
        result.Data.SnapshotJson.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateReport_AsSEOExecutive_Assigned_ReturnsCreated()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var request = new
        {
            Title = "SEO Exec Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-14),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi", "rankings" },
            ExecutiveNotes = "Sprint report"
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
    }

    [Fact]
    public async Task CreateReport_AsViewer_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var request = new
        {
            Title = "Viewer Unauthorized Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateReport_AsAnonymous_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var request = new
        {
            Title = "Anon Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateReport_AsNonMember_ReturnsForbidden()
    {
        // Unassigned user on Project B
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectBId;

        var request = new
        {
            Title = "Non Member Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateReport_WithInvalidDates_ReturnsBadRequest()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var request = new
        {
            Title = "Bad Date Range Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(5),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };

        var response = await client.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetReportsList_AsViewer_ReturnsOk()
    {
        var client = _factory.CreateAuthenticatedClient(SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        var response = await client.GetAsync($"/api/v1/projects/{projectId}/reports");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<ReportSummaryDto>>>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task SnapshotImmutability_UnderlyingDataChangesAfterCreation_ReportSnapshotRemainsUnchanged()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        // 1. Create Report
        var createRequest = new
        {
            Title = "Frozen Snapshot Test",
            StartDate = DateTimeOffset.UtcNow.AddDays(-30),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi", "rankings", "audit", "tasks" },
            ExecutiveNotes = "Original notes"
        };

        var createResponse = await adminClient.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        createResult.Should().NotBeNull();
        var reportId = createResult!.Data!.Id;
        var initialSnapshotJson = createResult.Data.SnapshotJson;

        // 2. Mutate live underlying data (add failing crawl, add tasks, etc.)
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<InternalSEO.Infrastructure.Persistence.ApplicationDbContext>();
            
            // Add a new crawl run with 0 health score
            db.CrawlRuns.Add(new CrawlRun
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Status = "Completed",
                HealthScore = 0m,
                UrlsCrawled = 50,
                ErrorsCount = 50,
                CompletedAt = DateTimeOffset.UtcNow
            });

            // Add 10 new overdue tasks
            for (int i = 0; i < 10; i++)
            {
                db.Tasks.Add(new TaskItem
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    Title = $"New Task {i}",
                    Status = "Open",
                    Priority = "Critical",
                    DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)),
                    CreatedBy = CustomWebApplicationFactory.AdminUserId
                });
            }

            await db.SaveChangesAsync();
        }

        // 3. Fetch report detail again
        var detailResponse = await adminClient.GetAsync($"/api/v1/projects/{projectId}/reports/{reportId}");
        detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var detailResult = await detailResponse.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();

        detailResult.Should().NotBeNull();
        // The snapshot must remain 100% byte-for-byte identical to the original frozen snapshot
        detailResult!.Data!.SnapshotJson.Should().Be(initialSnapshotJson);
        detailResult.Data.Title.Should().Be("Frozen Snapshot Test");
    }

    [Fact]
    public async Task GetReportDetail_CrossProjectAccess_ReturnsNotFound()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectAId = CustomWebApplicationFactory.ProjectAId;
        var projectBId = CustomWebApplicationFactory.ProjectBId;

        // Create Report on Project A
        var createRequest = new
        {
            Title = "Project A Private Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };
        var createResponse = await adminClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/reports", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        var reportId = createResult!.Data!.Id;

        // Try to access Project A report through Project B route
        var response = await adminClient.GetAsync($"/api/v1/projects/{projectBId}/reports/{reportId}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteReport_AsSuperAdmin_ReturnsOk_ThenNotFound()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        // Create Report
        var createRequest = new
        {
            Title = "Report to Delete",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };
        var createResponse = await adminClient.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        var reportId = createResult!.Data!.Id;

        // Delete report
        var deleteResponse = await adminClient.DeleteAsync($"/api/v1/projects/{projectId}/reports/{reportId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Fetch again -> 404
        var getResponse = await adminClient.GetAsync($"/api/v1/projects/{projectId}/reports/{reportId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteReport_AsSEOExecutive_ReturnsForbidden()
    {
        var adminClient = _factory.CreateAuthenticatedClient(SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var seoClient = _factory.CreateAuthenticatedClient(SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "seo@company.internal");
        var projectId = CustomWebApplicationFactory.ProjectAId;

        // Create Report
        var createRequest = new
        {
            Title = "Exec Cannot Delete This",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };
        var createResponse = await adminClient.PostAsJsonAsync($"/api/v1/projects/{projectId}/reports", createRequest);
        var createResult = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>();
        var reportId = createResult!.Data!.Id;

        // Attempt delete as SEO Executive
        var deleteResponse = await seoClient.DeleteAsync($"/api/v1/projects/{projectId}/reports/{reportId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private (HttpClient Client, Guid UserId) CreateUserWithRole(string roleName, bool assignToProjectA)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

        var userId = Guid.NewGuid();
        var email = $"{roleName.ToLowerInvariant().Replace(" ", "")}_{userId:N}@test.internal";

        var user = new User
        {
            Id = userId,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            FirstName = "Test",
            LastName = roleName,
            IsActive = true
        };
        user.PasswordHash = passwordHasher.HashPassword(user, "TestPassword123!");
        db.Users.Add(user);

        var role = db.Roles.FirstOrDefault(r => r.Name == roleName);
        if (role == null)
        {
            role = new Role { Id = Guid.NewGuid(), Name = roleName, NormalizedName = roleName.ToUpperInvariant() };
            db.Roles.Add(role);
        }
        db.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });

        if (assignToProjectA)
        {
            db.ProjectMembers.Add(new ProjectMember
            {
                Id = Guid.NewGuid(),
                ProjectId = CustomWebApplicationFactory.ProjectAId,
                UserId = userId,
                AccessLevel = ProjectAccessLevel.Member
            });
        }

        db.SaveChanges();

        var client = _factory.CreateAuthenticatedClient(roleName, userId, email);
        return (client, userId);
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("SEO Manager")]
    [InlineData("Content Writer")]
    public async Task Rbac_ProjectWriters_CanListDetailCreate_OnAssigned_ForbiddenDelete_AndForbiddenUnassigned(string roleName)
    {
        var (client, _) = CreateUserWithRole(roleName, assignToProjectA: true);
        var projA = CustomWebApplicationFactory.ProjectAId;
        var projB = CustomWebApplicationFactory.ProjectBId; // Unassigned

        // 1. Create on assigned project -> 201
        var createPayload = new
        {
            Title = $"{roleName} Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };
        var createResp = await client.PostAsJsonAsync($"/api/v1/projects/{projA}/reports", createPayload);
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdDto = (await createResp.Content.ReadFromJsonAsync<ApiResponse<ReportDetailDto>>())!.Data!;
        var reportId = createdDto.Id;

        // 2. List on assigned project -> 200
        var listResp = await client.GetAsync($"/api/v1/projects/{projA}/reports");
        listResp.StatusCode.Should().Be(HttpStatusCode.OK);

        // 3. Detail on assigned project -> 200
        var detailResp = await client.GetAsync($"/api/v1/projects/{projA}/reports/{reportId}");
        detailResp.StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Delete on assigned project -> 403 (SuperAdmin only)
        var delResp = await client.DeleteAsync($"/api/v1/projects/{projA}/reports/{reportId}");
        delResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 5. Unassigned Project B: list, detail, create, delete -> 403 Forbidden
        var unassignedList = await client.GetAsync($"/api/v1/projects/{projB}/reports");
        unassignedList.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var unassignedDetail = await client.GetAsync($"/api/v1/projects/{projB}/reports/{reportId}");
        unassignedDetail.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var unassignedCreate = await client.PostAsJsonAsync($"/api/v1/projects/{projB}/reports", createPayload);
        unassignedCreate.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var unassignedDelete = await client.DeleteAsync($"/api/v1/projects/{projB}/reports/{reportId}");
        unassignedDelete.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Rbac_NonMember_ForbiddenFromAllReportsEndpoints()
    {
        var (client, _) = CreateUserWithRole("SEO Manager", assignToProjectA: false);
        var projA = CustomWebApplicationFactory.ProjectAId;

        var listResp = await client.GetAsync($"/api/v1/projects/{projA}/reports");
        listResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var detailResp = await client.GetAsync($"/api/v1/projects/{projA}/reports/{Guid.NewGuid()}");
        detailResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var createPayload = new
        {
            Title = "Non-member Report",
            StartDate = DateTimeOffset.UtcNow.AddDays(-7),
            EndDate = DateTimeOffset.UtcNow,
            Sections = new[] { "kpi" }
        };
        var createResp = await client.PostAsJsonAsync($"/api/v1/projects/{projA}/reports", createPayload);
        createResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var delResp = await client.DeleteAsync($"/api/v1/projects/{projA}/reports/{Guid.NewGuid()}");
        delResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
