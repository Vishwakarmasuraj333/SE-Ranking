using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalSEO.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTechnicalAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditRules",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DefaultSeverity = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Warning"),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Recommendation = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CrawlRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "Queued"),
                    TriggerSource = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Manual"),
                    StartedAt = table.Column<long>(type: "INTEGER", nullable: true),
                    CompletedAt = table.Column<long>(type: "INTEGER", nullable: true),
                    UrlsDiscovered = table.Column<int>(type: "INTEGER", nullable: false),
                    UrlsCrawled = table.Column<int>(type: "INTEGER", nullable: false),
                    ErrorsCount = table.Column<int>(type: "INTEGER", nullable: false),
                    WarningsCount = table.Column<int>(type: "INTEGER", nullable: false),
                    NoticesCount = table.Column<int>(type: "INTEGER", nullable: false),
                    HealthScore = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: true),
                    FailureReason = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    CreatedBy = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrawlRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrawlRuns_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CrawlRuns_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProjectSettings",
                columns: table => new
                {
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CrawlMaxPages = table.Column<int>(type: "INTEGER", nullable: false),
                    CrawlMaxDepth = table.Column<int>(type: "INTEGER", nullable: false),
                    CrawlConcurrency = table.Column<int>(type: "INTEGER", nullable: false),
                    CrawlRateLimitMs = table.Column<int>(type: "INTEGER", nullable: false),
                    CrawlRespectRobotsTxt = table.Column<bool>(type: "INTEGER", nullable: false),
                    CrawlUserAgent = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false, defaultValue: "InternalSEOPlatformBot/1.0"),
                    RankTrackingFrequency = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "Daily"),
                    RankTrackingTime = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectSettings", x => x.ProjectId);
                    table.ForeignKey(
                        name: "FK_ProjectSettings_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditIssues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CrawlRunId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RuleCode = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Severity = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AffectedUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    AffectedUrlHash = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "Open"),
                    FirstSeenAt = table.Column<long>(type: "INTEGER", nullable: false),
                    LastSeenAt = table.Column<long>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditIssues_AuditRules_RuleCode",
                        column: x => x.RuleCode,
                        principalTable: "AuditRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AuditIssues_CrawlRuns_CrawlRunId",
                        column: x => x.CrawlRunId,
                        principalTable: "CrawlRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AuditIssues_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CrawlPages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CrawlRunId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    UrlHash = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    HttpStatusCode = table.Column<int>(type: "INTEGER", nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ContentLengthBytes = table.Column<long>(type: "INTEGER", nullable: true),
                    LoadTimeMs = table.Column<int>(type: "INTEGER", nullable: true),
                    CrawlDepth = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    TitleLength = table.Column<int>(type: "INTEGER", nullable: true),
                    MetaDescription = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    H1 = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    H1Count = table.Column<int>(type: "INTEGER", nullable: false),
                    CanonicalUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    IsIndexable = table.Column<bool>(type: "INTEGER", nullable: false),
                    IndexabilityStatus = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    InlinksCount = table.Column<int>(type: "INTEGER", nullable: false),
                    OutlinksCount = table.Column<int>(type: "INTEGER", nullable: false),
                    CrawledAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrawlPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrawlPages_CrawlRuns_CrawlRunId",
                        column: x => x.CrawlRunId,
                        principalTable: "CrawlRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CrawlPages_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "IssueEvidence",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IssueId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EvidenceType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    EvidencePayload = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueEvidence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IssueEvidence_AuditIssues_IssueId",
                        column: x => x.IssueId,
                        principalTable: "AuditIssues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditIssues_CrawlRunId_RuleCode",
                table: "AuditIssues",
                columns: new[] { "CrawlRunId", "RuleCode" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditIssues_ProjectId_Status_Severity",
                table: "AuditIssues",
                columns: new[] { "ProjectId", "Status", "Severity" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditIssues_RuleCode",
                table: "AuditIssues",
                column: "RuleCode");

            migrationBuilder.CreateIndex(
                name: "IX_CrawlPages_CrawlRunId_UrlHash",
                table: "CrawlPages",
                columns: new[] { "CrawlRunId", "UrlHash" });

            migrationBuilder.CreateIndex(
                name: "IX_CrawlPages_ProjectId_UrlHash",
                table: "CrawlPages",
                columns: new[] { "ProjectId", "UrlHash" });

            migrationBuilder.CreateIndex(
                name: "IX_CrawlRuns_CreatedBy",
                table: "CrawlRuns",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CrawlRuns_ProjectId_CreatedAt",
                table: "CrawlRuns",
                columns: new[] { "ProjectId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_IssueEvidence_IssueId",
                table: "IssueEvidence",
                column: "IssueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CrawlPages");

            migrationBuilder.DropTable(
                name: "IssueEvidence");

            migrationBuilder.DropTable(
                name: "ProjectSettings");

            migrationBuilder.DropTable(
                name: "AuditIssues");

            migrationBuilder.DropTable(
                name: "AuditRules");

            migrationBuilder.DropTable(
                name: "CrawlRuns");
        }
    }
}
