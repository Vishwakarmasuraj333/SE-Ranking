using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalSEO.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleSearchConsole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GoogleConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ServiceType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "GSC"),
                    PropertyIdentifier = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    AccountEmail = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    EncryptedRefreshToken = table.Column<string>(type: "TEXT", nullable: false),
                    TokenExpiresAt = table.Column<long>(type: "INTEGER", nullable: true),
                    SyncStatus = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "Active"),
                    LastSyncedAt = table.Column<long>(type: "INTEGER", nullable: true),
                    LastErrorMessage = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    UpdatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoogleConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoogleConnections_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GscDailyMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MetricDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Device = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "ALL"),
                    Clicks = table.Column<int>(type: "INTEGER", nullable: false),
                    Impressions = table.Column<int>(type: "INTEGER", nullable: false),
                    Ctr = table.Column<decimal>(type: "TEXT", precision: 7, scale: 4, nullable: false),
                    AveragePosition = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: false),
                    SyncedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GscDailyMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GscDailyMetrics_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GscQueryMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MetricDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    QueryText = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    PageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false),
                    CountryCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false, defaultValue: "ALL"),
                    Device = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "ALL"),
                    Clicks = table.Column<int>(type: "INTEGER", nullable: false),
                    Impressions = table.Column<int>(type: "INTEGER", nullable: false),
                    Ctr = table.Column<decimal>(type: "TEXT", precision: 7, scale: 4, nullable: false),
                    Position = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: false),
                    SyncedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GscQueryMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GscQueryMetrics_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "UQ_GoogleConnections_ProjectService",
                table: "GoogleConnections",
                columns: new[] { "ProjectId", "ServiceType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GscDailyMetrics_ProjectDate",
                table: "GscDailyMetrics",
                columns: new[] { "ProjectId", "MetricDate" });

            migrationBuilder.CreateIndex(
                name: "UQ_GscDailyMetrics",
                table: "GscDailyMetrics",
                columns: new[] { "ProjectId", "MetricDate", "Device" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GscQueryMetrics_Project_Date_Query",
                table: "GscQueryMetrics",
                columns: new[] { "ProjectId", "MetricDate", "QueryText" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GoogleConnections");

            migrationBuilder.DropTable(
                name: "GscDailyMetrics");

            migrationBuilder.DropTable(
                name: "GscQueryMetrics");
        }
    }
}
