using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace InternalSEO.Tests.Integration.Common;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    public static readonly Guid AdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid SeoUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid ViewerUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public static readonly Guid ProjectAId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid ProjectBId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext registration
            services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
            services.RemoveAll(typeof(ApplicationDbContext));
            services.RemoveAll(typeof(IApplicationDbContext));

            // Add in-memory DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
            });

            services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

            // Build and seed test database
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

            db.Database.EnsureCreated();
            SeedTestData(db, passwordHasher);
        });
    }

    private static void SeedTestData(ApplicationDbContext db, IPasswordHasherService passwordHasher)
    {
        if (db.Users.Any()) return;

        // Roles
        var adminRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SuperAdmin, NormalizedName = SystemRoles.SuperAdmin.ToUpperInvariant() };
        var seoRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SEOExecutive, NormalizedName = SystemRoles.SEOExecutive.ToUpperInvariant() };
        var viewerRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.Viewer, NormalizedName = SystemRoles.Viewer.ToUpperInvariant() };
        db.Roles.AddRange(adminRole, seoRole, viewerRole);

        // Admin Users
        var admin = new User
        {
            Id = AdminUserId,
            Email = "admin@company.internal",
            NormalizedEmail = "ADMIN@COMPANY.INTERNAL",
            FirstName = "System",
            LastName = "Admin",
            IsActive = true
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "AdminPassword123!");
        db.Users.Add(admin);
        db.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = adminRole.Id });

        var adminLocal = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111110"),
            Email = "admin@internal-seo.local",
            NormalizedEmail = "ADMIN@INTERNAL-SEO.LOCAL",
            FirstName = "System",
            LastName = "Admin",
            IsActive = true
        };
        adminLocal.PasswordHash = passwordHasher.HashPassword(adminLocal, "AdminPassword123!");
        db.Users.Add(adminLocal);
        db.UserRoles.Add(new UserRole { UserId = adminLocal.Id, RoleId = adminRole.Id });

        // SEO Executive Users
        var seo = new User
        {
            Id = SeoUserId,
            Email = "seo@company.internal",
            NormalizedEmail = "SEO@COMPANY.INTERNAL",
            FirstName = "SEO",
            LastName = "Exec",
            IsActive = true
        };
        seo.PasswordHash = passwordHasher.HashPassword(seo, "SeoPassword123!");
        db.Users.Add(seo);
        db.UserRoles.Add(new UserRole { UserId = seo.Id, RoleId = seoRole.Id });

        var seoLocal = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222220"),
            Email = "exec@internal-seo.local",
            NormalizedEmail = "EXEC@INTERNAL-SEO.LOCAL",
            FirstName = "SEO",
            LastName = "Exec",
            IsActive = true
        };
        seoLocal.PasswordHash = passwordHasher.HashPassword(seoLocal, "ExecPassword123!");
        db.Users.Add(seoLocal);
        db.UserRoles.Add(new UserRole { UserId = seoLocal.Id, RoleId = seoRole.Id });

        // Viewer Users
        var viewer = new User
        {
            Id = ViewerUserId,
            Email = "viewer@company.internal",
            NormalizedEmail = "VIEWER@COMPANY.INTERNAL",
            FirstName = "Viewer",
            LastName = "User",
            IsActive = true
        };
        viewer.PasswordHash = passwordHasher.HashPassword(viewer, "ViewerPassword123!");
        db.Users.Add(viewer);
        db.UserRoles.Add(new UserRole { UserId = viewer.Id, RoleId = viewerRole.Id });

        var viewerLocal = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333330"),
            Email = "viewer@internal-seo.local",
            NormalizedEmail = "VIEWER@INTERNAL-SEO.LOCAL",
            FirstName = "Viewer",
            LastName = "User",
            IsActive = true
        };
        viewerLocal.PasswordHash = passwordHasher.HashPassword(viewerLocal, "ViewerPassword123!");
        db.Users.Add(viewerLocal);
        db.UserRoles.Add(new UserRole { UserId = viewerLocal.Id, RoleId = viewerRole.Id });

        // Project A (Assigned to Admin, SEO Exec, Viewer)
        var projectA = new Project
        {
            Id = ProjectAId,
            Name = "Project Alpha (Assigned)",
            PrimaryDomain = "alpha.company.com",
            Protocol = "https://",
            CountryCode = "US",
            LanguageCode = "en",
            Status = ProjectStatus.Active,
            CreatedBy = AdminUserId
        };
        projectA.Members.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = ProjectAId, UserId = AdminUserId, AccessLevel = ProjectAccessLevel.Owner });
        projectA.Members.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = ProjectAId, UserId = SeoUserId, AccessLevel = ProjectAccessLevel.Member });
        projectA.Members.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = ProjectAId, UserId = ViewerUserId, AccessLevel = ProjectAccessLevel.ReadOnly });
        db.Projects.Add(projectA);

        // Project B (Secret: Only Admin is member)
        var projectB = new Project
        {
            Id = ProjectBId,
            Name = "Project Beta (Secret Unassigned)",
            PrimaryDomain = "secret.company.com",
            Protocol = "https://",
            CountryCode = "US",
            LanguageCode = "en",
            Status = ProjectStatus.Active,
            CreatedBy = AdminUserId
        };
        projectB.Members.Add(new ProjectMember { Id = Guid.NewGuid(), ProjectId = ProjectBId, UserId = AdminUserId, AccessLevel = ProjectAccessLevel.Owner });
        db.Projects.Add(projectB);

        db.SaveChanges();
    }

    public HttpClient CreateAuthenticatedClient(string role, Guid userId, string email)
    {
        var client = CreateClient();

        using var scope = Services.CreateScope();
        var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();

        var user = new User
        {
            Id = userId,
            Email = email,
            FirstName = "Test",
            LastName = role
        };

        var token = tokenService.GenerateAccessToken(user, role);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return client;
    }
}
