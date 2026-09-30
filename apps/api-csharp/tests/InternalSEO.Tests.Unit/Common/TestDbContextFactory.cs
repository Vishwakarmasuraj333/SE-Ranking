using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using InternalSEO.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InternalSEO.Tests.Unit.Common;

public static class TestDbContextFactory
{
    public static ApplicationDbContext Create()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();

        // Seed default roles
        var adminRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SuperAdmin, NormalizedName = SystemRoles.SuperAdmin.ToUpperInvariant() };
        var seoRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.SEOExecutive, NormalizedName = SystemRoles.SEOExecutive.ToUpperInvariant() };
        var viewerRole = new Role { Id = Guid.NewGuid(), Name = SystemRoles.Viewer, NormalizedName = SystemRoles.Viewer.ToUpperInvariant() };

        context.Roles.AddRange(adminRole, seoRole, viewerRole);
        context.SaveChanges();

        return context;
    }
}
