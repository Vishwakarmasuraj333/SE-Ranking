using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using InternalSEO.Api.Controllers;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Application.Common.Models;
using InternalSEO.Application.Features.Competitors.DTOs;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using InternalSEO.Tests.Integration.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InternalSEO.Tests.Integration.Competitors;

public class CompetitorGapEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CompetitorGapEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedGapTestData();
    }

    private void SeedGapTestData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var projectAId = CustomWebApplicationFactory.ProjectAId;
        var projectBId = CustomWebApplicationFactory.ProjectBId;

        // Ensure Competitors for Project A
        var compA1 = db.Competitors.FirstOrDefault(c => c.ProjectId == projectAId && c.Domain == "alphagap.com");
        if (compA1 == null)
        {
            compA1 = new Competitor
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                ProjectId = projectAId,
                Name = "Alpha Gap Competitor",
                Domain = "alphagap.com",
                Notes = "Gap comp 1"
            };
            db.Competitors.Add(compA1);
        }

        var compA2 = db.Competitors.FirstOrDefault(c => c.ProjectId == projectAId && c.Domain == "betagap.com");
        if (compA2 == null)
        {
            compA2 = new Competitor
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                ProjectId = projectAId,
                Name = "Beta Gap Competitor",
                Domain = "betagap.com",
                Notes = "Gap comp 2"
            };
            db.Competitors.Add(compA2);
        }

        // Competitor for Project B
        var compB = db.Competitors.FirstOrDefault(c => c.ProjectId == projectBId && c.Domain == "secretgap.com");
        if (compB == null)
        {
            compB = new Competitor
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                ProjectId = projectBId,
                Name = "Secret Gap Competitor",
                Domain = "secretgap.com",
                Notes = "Project B comp"
            };
            db.Competitors.Add(compB);
        }

        // Seed Keywords for Project A
        var kwGapActive = db.Keywords.FirstOrDefault(k => k.ProjectId == projectAId && k.KeywordText == "gap active kw");
        if (kwGapActive == null)
        {
            kwGapActive = new Keyword
            {
                Id = Guid.Parse("11111111-aaaa-1111-aaaa-111111111111"),
                ProjectId = projectAId,
                KeywordText = "gap active kw",
                NormalizedText = "gap active kw",
                MonthlySearchVolume = 1500,
                IsActive = true,
                CreatedBy = CustomWebApplicationFactory.AdminUserId
            };
            db.Keywords.Add(kwGapActive);
        }

        var kwGapInactive = db.Keywords.FirstOrDefault(k => k.ProjectId == projectAId && k.KeywordText == "gap inactive kw");
        if (kwGapInactive == null)
        {
            kwGapInactive = new Keyword
            {
                Id = Guid.Parse("22222222-bbbb-2222-bbbb-222222222222"),
                ProjectId = projectAId,
                KeywordText = "gap inactive kw",
                NormalizedText = "gap inactive kw",
                MonthlySearchVolume = 2500,
                IsActive = false,
                CreatedBy = CustomWebApplicationFactory.AdminUserId
            };
            db.Keywords.Add(kwGapInactive);
        }

        var kwNoGap = db.Keywords.FirstOrDefault(k => k.ProjectId == projectAId && k.KeywordText == "ranked target top5");
        if (kwNoGap == null)
        {
            kwNoGap = new Keyword
            {
                Id = Guid.Parse("33333333-cccc-3333-cccc-333333333333"),
                ProjectId = projectAId,
                KeywordText = "ranked target top5",
                NormalizedText = "ranked target top5",
                MonthlySearchVolume = 3000,
                IsActive = true,
                CreatedBy = CustomWebApplicationFactory.AdminUserId
            };
            db.Keywords.Add(kwNoGap);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // kwGapActive: Target position = 25 (outside top 20), Comp1 = 2 (inside top 20), Comp2 = 8
        if (!db.RankResults.Any(r => r.KeywordId == kwGapActive.Id))
        {
            db.RankResults.Add(new RankResult
            {
                ProjectId = projectAId,
                KeywordId = kwGapActive.Id,
                CheckDate = today,
                Position = 25,
                RecordedAt = DateTimeOffset.UtcNow
            });
        }
        if (!db.CompetitorRankResults.Any(cr => cr.KeywordId == kwGapActive.Id && cr.CompetitorId == compA1.Id))
        {
            db.CompetitorRankResults.Add(new CompetitorRankResult
            {
                ProjectId = projectAId,
                KeywordId = kwGapActive.Id,
                CompetitorId = compA1.Id,
                CheckDate = today,
                Position = 2,
                RecordedAt = DateTimeOffset.UtcNow
            });
            db.CompetitorRankResults.Add(new CompetitorRankResult
            {
                ProjectId = projectAId,
                KeywordId = kwGapActive.Id,
                CompetitorId = compA2.Id,
                CheckDate = today,
                Position = 8,
                RecordedAt = DateTimeOffset.UtcNow
            });
        }

        // kwGapInactive: Target position = null (unranked), Comp1 = 5
        if (!db.CompetitorRankResults.Any(cr => cr.KeywordId == kwGapInactive.Id && cr.CompetitorId == compA1.Id))
        {
            db.CompetitorRankResults.Add(new CompetitorRankResult
            {
                ProjectId = projectAId,
                KeywordId = kwGapInactive.Id,
                CompetitorId = compA1.Id,
                CheckDate = today,
                Position = 5,
                RecordedAt = DateTimeOffset.UtcNow
            });
        }

        // kwNoGap: Target position = 4 (inside top 20) -> should be EXCLUDED from gap
        if (!db.RankResults.Any(r => r.KeywordId == kwNoGap.Id))
        {
            db.RankResults.Add(new RankResult
            {
                ProjectId = projectAId,
                KeywordId = kwNoGap.Id,
                CheckDate = today,
                Position = 4,
                RecordedAt = DateTimeOffset.UtcNow
            });
            db.CompetitorRankResults.Add(new CompetitorRankResult
            {
                ProjectId = projectAId,
                KeywordId = kwNoGap.Id,
                CompetitorId = compA1.Id,
                CheckDate = today,
                Position = 3,
                RecordedAt = DateTimeOffset.UtcNow
            });
        }

        db.SaveChanges();
    }

    private (HttpClient client, Guid userId) CreateUserWithRole(string roleName, bool assignToProjectA = true)
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

    [Fact]
    public async Task GetGap_Populated_ReturnsGapItems_WithScoresAndBestCompetitor()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        body.Should().NotBeNull();
        body!.Success.Should().BeTrue();
        body.Data!.Items.Should().NotBeEmpty();

        // Target Top 5 keyword must be excluded
        body.Data.Items.Should().NotContain(x => x.KeywordText == "ranked target top5");

        // kwGapActive must be included with best position = 2
        var activeGap = body.Data.Items.FirstOrDefault(x => x.KeywordText == "gap active kw");
        activeGap.Should().NotBeNull();
        activeGap!.BestCompetitorPosition.Should().Be(2);
        activeGap.TargetPosition.Should().Be(25);
        activeGap.OpportunityScore.Should().Be(37.1); // Volume 1500 * 24.7 / 1000 = 37.05 -> 37.1
        activeGap.IsActive.Should().BeTrue();

        // kwGapInactive must be included with best position = 5 and IsActive = false
        var inactiveGap = body.Data.Items.FirstOrDefault(x => x.KeywordText == "gap inactive kw");
        inactiveGap.Should().NotBeNull();
        inactiveGap!.BestCompetitorPosition.Should().Be(5);
        inactiveGap.TargetPosition.Should().BeNull();
        inactiveGap.OpportunityScore.Should().Be(23.8); // Volume 2500 * 9.5 / 1000 = 23.75 -> 23.8
        inactiveGap.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task GetGap_CompetitorFilter_FiltersBySpecificCompetitor()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var comp2Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?competitorId={comp2Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        body.Should().NotBeNull();
        // Only kwGapActive has observations for comp2
        body!.Data!.Items.Should().OnlyContain(x => x.KeywordText == "gap active kw");
        body.Data.Items[0].BestCompetitorId.Should().Be(comp2Id);
        body.Data.Items[0].BestCompetitorPosition.Should().Be(8);
    }

    [Fact]
    public async Task GetGap_SearchFilter_ReturnsMatchingKeywordsOnly()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?search=inactive");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        body!.Data!.Items.Should().OnlyContain(x => x.KeywordText.Contains("inactive"));
    }

    [Fact]
    public async Task GetGap_Sorting_WorksAsExpected()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var resScore = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?sort=opportunityscore");
        resScore.StatusCode.Should().Be(HttpStatusCode.OK);
        var bodyScore = await resScore.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        bodyScore!.Data!.Items.Should().BeInDescendingOrder(x => x.OpportunityScore);

        var resVolume = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?sort=searchvolume");
        resVolume.StatusCode.Should().Be(HttpStatusCode.OK);
        var bodyVolume = await resVolume.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        var volumes = bodyVolume!.Data!.Items.Select(x => x.SearchVolume ?? 0).ToList();
        volumes.Should().BeInDescendingOrder();
    }

    [Fact]
    public async Task GetGap_Pagination_CapsMaxPageSizeAt100()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?pageSize=500");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<CompetitorGapResponseDto>>();
        body!.Data!.PageSize.Should().Be(100);
    }

    [Fact]
    public async Task CrossProjectIsolation_ProjectBCompetitorSuppliedToProjectA_ReturnsNotFound()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var compBId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectAId}/competitors/gap?competitorId={compBId}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CrossProjectIsolation_ProjectAUserCannotAccessProjectBGap()
    {
        var client = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");

        var response = await client.GetAsync($"/api/v1/projects/{CustomWebApplicationFactory.ProjectBId}/competitors/gap");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Rbac_All8Contexts_GetGapEndpoint()
    {
        var projectAId = CustomWebApplicationFactory.ProjectAId;

        // 1. SuperAdmin -> 200
        var superAdminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var r1 = await superAdminClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r1.StatusCode.Should().Be(HttpStatusCode.OK);

        // 2. Admin (assigned) -> 200
        var (adminClient, _) = CreateUserWithRole("Admin", assignToProjectA: true);
        var r2 = await adminClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r2.StatusCode.Should().Be(HttpStatusCode.OK);

        // 3. SEO Manager (assigned) -> 200
        var (managerClient, _) = CreateUserWithRole("SEO Manager", assignToProjectA: true);
        var r3 = await managerClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r3.StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Content Writer (assigned) -> 200
        var (writerClient, _) = CreateUserWithRole("Content Writer", assignToProjectA: true);
        var r4 = await writerClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r4.StatusCode.Should().Be(HttpStatusCode.OK);

        // 5. Viewer (assigned) -> 200
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var r5 = await viewerClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r5.StatusCode.Should().Be(HttpStatusCode.OK);

        // 6. SEO Executive (assigned) -> 200
        var execClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");
        var r6 = await execClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r6.StatusCode.Should().Be(HttpStatusCode.OK);

        // 7. Non-member -> 403
        var (nonMemberClient, _) = CreateUserWithRole(SystemRoles.Viewer, assignToProjectA: false);
        var r7 = await nonMemberClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r7.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 8. Anonymous -> 401
        var anonClient = _factory.CreateClient();
        var r8 = await anonClient.GetAsync($"/api/v1/projects/{projectAId}/competitors/gap");
        r8.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Rbac_All8Contexts_AddToTracked_Activation()
    {
        var projectAId = CustomWebApplicationFactory.ProjectAId;
        var kwId = Guid.Parse("22222222-bbbb-2222-bbbb-222222222222"); // kwGapInactive

        var req = new BulkStatusRequest { KeywordIds = new List<Guid> { kwId }, IsActive = true };

        // 1. SuperAdmin -> allowed (200)
        var superAdminClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SuperAdmin, CustomWebApplicationFactory.AdminUserId, "admin@company.internal");
        var r1 = await superAdminClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r1.StatusCode.Should().Be(HttpStatusCode.OK);

        // 2. Admin (assigned) -> allowed (200)
        var (adminClient, _) = CreateUserWithRole("Admin", assignToProjectA: true);
        var r2 = await adminClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r2.StatusCode.Should().Be(HttpStatusCode.OK);

        // 3. SEO Manager (assigned) -> allowed (200)
        var (managerClient, _) = CreateUserWithRole("SEO Manager", assignToProjectA: true);
        var r3 = await managerClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r3.StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Content Writer (assigned) -> allowed (200)
        var (writerClient, _) = CreateUserWithRole("Content Writer", assignToProjectA: true);
        var r4 = await writerClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r4.StatusCode.Should().Be(HttpStatusCode.OK);

        // 5. SEO Executive (assigned) -> allowed (200)
        var execClient = _factory.CreateAuthenticatedClient(
            SystemRoles.SEOExecutive, CustomWebApplicationFactory.SeoUserId, "exec@company.internal");
        var r5 = await execClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r5.StatusCode.Should().Be(HttpStatusCode.OK);

        // 6. Viewer (assigned) -> 403 Forbidden
        var viewerClient = _factory.CreateAuthenticatedClient(
            SystemRoles.Viewer, CustomWebApplicationFactory.ViewerUserId, "viewer@company.internal");
        var r6 = await viewerClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r6.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 7. Non-member -> 403 Forbidden
        var (nonMemberClient, _) = CreateUserWithRole(SystemRoles.Viewer, assignToProjectA: false);
        var r7 = await nonMemberClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r7.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 8. Anonymous -> 401 Unauthorized
        var anonClient = _factory.CreateClient();
        var r8 = await anonClient.PostAsJsonAsync($"/api/v1/projects/{projectAId}/keywords/bulk-status", req);
        r8.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
