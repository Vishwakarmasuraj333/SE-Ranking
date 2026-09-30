using InternalSEO.Application.Common.Interfaces;
using InternalSEO.Domain.Constants;
using InternalSEO.Domain.Entities;
using InternalSEO.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InternalSEO.Infrastructure.Persistence.Seed;

public class DbInitializer
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializer(
        ApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        ILogger<DbInitializer> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            if (_context.Database.IsRelational())
            {
                await _context.Database.MigrateAsync();
            }
            else
            {
                await _context.Database.EnsureCreatedAsync();
            }

            // Seed Roles
            if (!await _context.Roles.AnyAsync())
            {
                _logger.LogInformation("Seeding default roles...");
                var roles = new List<Role>
                {
                    new() { Id = Guid.NewGuid(), Name = SystemRoles.SuperAdmin, NormalizedName = SystemRoles.SuperAdmin.ToUpperInvariant(), Description = "Unrestricted internal administrator" },
                    new() { Id = Guid.NewGuid(), Name = SystemRoles.SEOExecutive, NormalizedName = SystemRoles.SEOExecutive.ToUpperInvariant(), Description = "SEO Specialist performing operational workflows" },
                    new() { Id = Guid.NewGuid(), Name = SystemRoles.Viewer, NormalizedName = SystemRoles.Viewer.ToUpperInvariant(), Description = "Read-only access to permitted projects" }
                };
                _context.Roles.AddRange(roles);
                await _context.SaveChangesAsync();
            }

            // Seed Default Users
            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Seeding default users...");
                var adminRole = await _context.Roles.FirstAsync(r => r.Name == SystemRoles.SuperAdmin);
                var seoRole = await _context.Roles.FirstAsync(r => r.Name == SystemRoles.SEOExecutive);
                var viewerRole = await _context.Roles.FirstAsync(r => r.Name == SystemRoles.Viewer);

                // Admin Users
                var adminUser = new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Email = "admin@internal-seo.local",
                    NormalizedEmail = "ADMIN@INTERNAL-SEO.LOCAL",
                    FirstName = "System",
                    LastName = "Administrator",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                adminUser.PasswordHash = _passwordHasher.HashPassword(adminUser, "AdminPassword123!");
                _context.Users.Add(adminUser);
                _context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });

                var adminUserLegacy = new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111112"),
                    Email = "admin@company.internal",
                    NormalizedEmail = "ADMIN@COMPANY.INTERNAL",
                    FirstName = "System",
                    LastName = "Administrator",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                adminUserLegacy.PasswordHash = _passwordHasher.HashPassword(adminUserLegacy, "AdminPassword123!");
                _context.Users.Add(adminUserLegacy);
                _context.UserRoles.Add(new UserRole { UserId = adminUserLegacy.Id, RoleId = adminRole.Id });

                // SEO Executive Users
                var seoUser = new User
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Email = "exec@internal-seo.local",
                    NormalizedEmail = "EXEC@INTERNAL-SEO.LOCAL",
                    FirstName = "Sarah",
                    LastName = "Executive",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                seoUser.PasswordHash = _passwordHasher.HashPassword(seoUser, "ExecPassword123!");
                _context.Users.Add(seoUser);
                _context.UserRoles.Add(new UserRole { UserId = seoUser.Id, RoleId = seoRole.Id });

                var seoUserLegacy = new User
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222223"),
                    Email = "seo@company.internal",
                    NormalizedEmail = "SEO@COMPANY.INTERNAL",
                    FirstName = "Sarah",
                    LastName = "Executive",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                seoUserLegacy.PasswordHash = _passwordHasher.HashPassword(seoUserLegacy, "SeoPassword123!");
                _context.Users.Add(seoUserLegacy);
                _context.UserRoles.Add(new UserRole { UserId = seoUserLegacy.Id, RoleId = seoRole.Id });

                // Viewer Users
                var viewerUser = new User
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Email = "viewer@internal-seo.local",
                    NormalizedEmail = "VIEWER@INTERNAL-SEO.LOCAL",
                    FirstName = "Victor",
                    LastName = "Viewer",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                viewerUser.PasswordHash = _passwordHasher.HashPassword(viewerUser, "ViewerPassword123!");
                _context.Users.Add(viewerUser);
                _context.UserRoles.Add(new UserRole { UserId = viewerUser.Id, RoleId = viewerRole.Id });

                var viewerUserLegacy = new User
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333334"),
                    Email = "viewer@company.internal",
                    NormalizedEmail = "VIEWER@COMPANY.INTERNAL",
                    FirstName = "Victor",
                    LastName = "Viewer",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                viewerUserLegacy.PasswordHash = _passwordHasher.HashPassword(viewerUserLegacy, "ViewerPassword123!");
                _context.Users.Add(viewerUserLegacy);
                _context.UserRoles.Add(new UserRole { UserId = viewerUserLegacy.Id, RoleId = viewerRole.Id });

                // Seed Default Project
                var sampleProject = new Project
                {
                    Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    Name = "Internal Corporate Portal",
                    PrimaryDomain = "portal.company.com",
                    Protocol = "https://",
                    Industry = "Enterprise Software",
                    CountryCode = "US",
                    PrimaryLocation = "New York, United States",
                    LanguageCode = "en",
                    Timezone = "America/New_York",
                    DefaultSearchEngine = "google",
                    DefaultDevice = "desktop",
                    Status = ProjectStatus.Active,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                sampleProject.Members.Add(new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    UserId = adminUser.Id,
                    AccessLevel = ProjectAccessLevel.Owner,
                    AssignedAt = DateTimeOffset.UtcNow,
                    AssignedBy = adminUser.Id
                });

                sampleProject.Members.Add(new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    UserId = seoUser.Id,
                    AccessLevel = ProjectAccessLevel.Member,
                    AssignedAt = DateTimeOffset.UtcNow,
                    AssignedBy = adminUser.Id
                });

                sampleProject.Members.Add(new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    UserId = viewerUser.Id,
                    AccessLevel = ProjectAccessLevel.ReadOnly,
                    AssignedAt = DateTimeOffset.UtcNow,
                    AssignedBy = adminUser.Id
                });

                _context.Projects.Add(sampleProject);
                await _context.SaveChangesAsync();

                // Seed Keyword Groups & Tags & Sample Keywords
                var brandGroup = new KeywordGroup { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "Brand", ColorHex = "#3B82F6" };
                var featuresGroup = new KeywordGroup { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "Core Features", ColorHex = "#10B981" };
                var enterpriseGroup = new KeywordGroup { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "Enterprise", ColorHex = "#8B5CF6" };
                _context.KeywordGroups.AddRange(brandGroup, featuresGroup, enterpriseGroup);

                var tagP1 = new Tag { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "p1-core" };
                var tagBrand = new Tag { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "brand" };
                var tagProduct = new Tag { Id = Guid.NewGuid(), ProjectId = sampleProject.Id, Name = "product" };
                _context.Tags.AddRange(tagP1, tagBrand, tagProduct);

                var kw1 = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    GroupId = brandGroup.Id,
                    KeywordText = "portal login",
                    NormalizedText = "portal login",
                    SearchEngine = "google",
                    CountryCode = "US",
                    LocationName = "United States",
                    LanguageCode = "en",
                    Device = "desktop",
                    TargetUrl = "https://portal.company.com/login",
                    SearchIntent = "Navigational",
                    MonthlySearchVolume = 4800,
                    KeywordDifficulty = 18.5m,
                    CpcUsd = 1.25m,
                    IsActive = true,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                kw1.KeywordTags.Add(new KeywordTag { KeywordId = kw1.Id, TagId = tagBrand.Id });

                var kw2 = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    GroupId = featuresGroup.Id,
                    KeywordText = "internal portal software",
                    NormalizedText = "internal portal software",
                    SearchEngine = "google",
                    CountryCode = "US",
                    LocationName = "United States",
                    LanguageCode = "en",
                    Device = "desktop",
                    TargetUrl = "https://portal.company.com/features",
                    SearchIntent = "Commercial",
                    MonthlySearchVolume = 1900,
                    KeywordDifficulty = 42.0m,
                    CpcUsd = 4.80m,
                    IsActive = true,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                kw2.KeywordTags.Add(new KeywordTag { KeywordId = kw2.Id, TagId = tagP1.Id });
                kw2.KeywordTags.Add(new KeywordTag { KeywordId = kw2.Id, TagId = tagProduct.Id });

                var kw3 = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    GroupId = enterpriseGroup.Id,
                    KeywordText = "enterprise intranet security",
                    NormalizedText = "enterprise intranet security",
                    SearchEngine = "google",
                    CountryCode = "US",
                    LocationName = "United States",
                    LanguageCode = "en",
                    Device = "desktop",
                    TargetUrl = "https://portal.company.com/security",
                    SearchIntent = "Informational",
                    MonthlySearchVolume = 850,
                    KeywordDifficulty = 56.5m,
                    CpcUsd = 6.10m,
                    IsActive = true,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                kw3.KeywordTags.Add(new KeywordTag { KeywordId = kw3.Id, TagId = tagP1.Id });

                var kw4 = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    GroupId = brandGroup.Id,
                    KeywordText = "company employee portal",
                    NormalizedText = "company employee portal",
                    SearchEngine = "google",
                    CountryCode = "US",
                    LocationName = "United States",
                    LanguageCode = "en",
                    Device = "mobile",
                    TargetUrl = "https://portal.company.com/",
                    SearchIntent = "Commercial",
                    MonthlySearchVolume = 3200,
                    KeywordDifficulty = 29.0m,
                    CpcUsd = 2.40m,
                    IsActive = true,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                kw4.KeywordTags.Add(new KeywordTag { KeywordId = kw4.Id, TagId = tagBrand.Id });

                var kw5 = new Keyword
                {
                    Id = Guid.NewGuid(),
                    ProjectId = sampleProject.Id,
                    GroupId = featuresGroup.Id,
                    KeywordText = "cloud workspace portal",
                    NormalizedText = "cloud workspace portal",
                    SearchEngine = "google",
                    CountryCode = "US",
                    LocationName = "United States",
                    LanguageCode = "en",
                    Device = "desktop",
                    TargetUrl = "https://portal.company.com/pricing",
                    SearchIntent = "Transactional",
                    MonthlySearchVolume = 1200,
                    KeywordDifficulty = 64.0m,
                    CpcUsd = 8.50m,
                    IsActive = false,
                    CreatedBy = adminUser.Id,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                kw5.KeywordTags.Add(new KeywordTag { KeywordId = kw5.Id, TagId = tagProduct.Id });

                _context.Keywords.AddRange(kw1, kw2, kw3, kw4, kw5);
                await _context.SaveChangesAsync();

                // Seed Deterministic Development Ranking Observations
                if (!await _context.RankResults.AnyAsync())
                {
                    _logger.LogInformation("Seeding deterministic development rank results...");
                    var rankResults = new List<RankResult>();
                    var today = DateOnly.FromDateTime(DateTime.UtcNow);

                    // Daily historical trends across the last 7 days
                    var historicalProfiles = new[]
                    {
                        new { Keyword = kw1, Positions = new int?[] { 4, 4, 3, 3, 3, 3, 2 }, Url = (string?)"https://portal.company.com/login" },
                        new { Keyword = kw2, Positions = new int?[] { 7, 6, 6, 5, 5, 5, 5 }, Url = (string?)"https://portal.company.com/features" },
                        new { Keyword = kw3, Positions = new int?[] { 8, 8, 8, 8, 8, 8, 9 }, Url = (string?)"https://portal.company.com/security" },
                        new { Keyword = kw4, Positions = new int?[] { 28, 27, 27, 26, 26, 26, 24 }, Url = (string?)"https://portal.company.com/" },
                        new { Keyword = kw5, Positions = new int?[] { null, null, null, null, null, null, null }, Url = (string?)null }
                    };

                    for (int dayOffset = 6; dayOffset >= 0; dayOffset--)
                    {
                        var checkDate = today.AddDays(-dayOffset);
                        int dayIndex = 6 - dayOffset; // 0..6

                        foreach (var profile in historicalProfiles)
                        {
                            int? currentPos = profile.Positions[dayIndex];
                            int? prevPos = dayIndex > 0 ? profile.Positions[dayIndex - 1] : (currentPos.HasValue ? currentPos.Value + 1 : null);
                            int? change = (currentPos.HasValue && prevPos.HasValue) ? (prevPos.Value - currentPos.Value) : null;

                            rankResults.Add(new RankResult
                            {
                                KeywordId = profile.Keyword.Id,
                                ProjectId = sampleProject.Id,
                                CheckDate = checkDate,
                                Position = currentPos,
                                PreviousPosition = prevPos,
                                PositionChange = change,
                                RankedUrl = profile.Url,
                                IsTargetUrlMatched = profile.Url != null,
                                IsCannibalized = false,
                                SerpFeatures = "people_also_ask,featured_snippet",
                                ProviderName = "development",
                                RecordedAt = DateTimeOffset.UtcNow.AddDays(-dayOffset)
                            });
                        }
                    }

                    _context.RankResults.AddRange(rankResults);
                    await _context.SaveChangesAsync();
                }

                // Seed Default Audit Rules
                if (!await _context.AuditRules.AnyAsync())
                {
                    _logger.LogInformation("Seeding default audit rules...");
                    var auditRules = new List<AuditRule>
                    {
                        new() { Id = "RULE-HTTP-404", Category = "Indexability", DefaultSeverity = "Error", Title = "Page Returns HTTP 404 (Not Found)", Description = "The server returned a 404 client error indicating the resource could not be found.", Recommendation = "Fix broken internal links or implement a 301 redirect to a relevant live URL." },
                        new() { Id = "RULE-HTTP-5XX", Category = "Indexability", DefaultSeverity = "Error", Title = "Page Returns HTTP 5xx Server Error", Description = "The web server encountered an internal error while processing the request.", Recommendation = "Inspect server application logs and fix backend application/database errors." },
                        new() { Id = "RULE-TITLE-MISSING", Category = "Content", DefaultSeverity = "Error", Title = "Missing <title> Tag", Description = "The HTML document is missing a <title> element or the tag is completely empty.", Recommendation = "Add a unique, descriptive <title> tag between 30 and 60 characters." },
                        new() { Id = "RULE-TITLE-DUPLICATE", Category = "Content", DefaultSeverity = "Error", Title = "Duplicate <title> Tag", Description = "Multiple pages on the site share the exact same title tag, causing ranking cannibalization.", Recommendation = "Ensure every indexable page has a distinct, descriptive title." },
                        new() { Id = "RULE-META-DESC-MISSING", Category = "Content", DefaultSeverity = "Warning", Title = "Missing Meta Description", Description = "The page does not have a <meta name=\"description\"> tag.", Recommendation = "Add a compelling meta description between 120 and 160 characters summarizing the page." },
                        new() { Id = "RULE-CANONICAL-MISSING", Category = "Indexability", DefaultSeverity = "Warning", Title = "Missing Canonical URL", Description = "The page does not specify a <link rel=\"canonical\"> tag, risking duplicate content issues.", Recommendation = "Add a self-referencing or target canonical URL tag to define the primary version." },
                        new() { Id = "RULE-BROKEN-INTERNAL-LINK", Category = "Links", DefaultSeverity = "Error", Title = "Broken Internal Hyperlink", Description = "An internal link points to a destination that returns a 4xx or 5xx HTTP status.", Recommendation = "Update the href attribute to point to the correct live URL or remove the broken anchor." },
                        new() { Id = "RULE-REDIRECT-FOUND", Category = "Links", DefaultSeverity = "Notice", Title = "Internal URL Returns HTTP 3xx Redirect", Description = "The internal link points to a redirecting URL rather than the final destination.", Recommendation = "Update internal hyperlinks directly to the final canonical destination URL." }
                    };
                    _context.AuditRules.AddRange(auditRules);
                    await _context.SaveChangesAsync();
                }

                // Seed Default ProjectSettings for Sample Project
                if (!await _context.ProjectSettings.AnyAsync(s => s.ProjectId == sampleProject.Id))
                {
                    _context.ProjectSettings.Add(new ProjectSettings
                    {
                        ProjectId = sampleProject.Id,
                        CrawlMaxPages = 100,
                        CrawlMaxDepth = 5,
                        CrawlConcurrency = 2,
                        CrawlRateLimitMs = 100,
                        CrawlRespectRobotsTxt = true,
                        CrawlUserAgent = "InternalSEOPlatformBot/1.0",
                        UpdatedAt = DateTimeOffset.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Database seed completed successfully.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
