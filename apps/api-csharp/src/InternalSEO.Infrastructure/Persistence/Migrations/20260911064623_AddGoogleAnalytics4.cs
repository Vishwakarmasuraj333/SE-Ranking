using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalSEO.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleAnalytics4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_User_Read",
                table: "Notifications");

            migrationBuilder.CreateTable(
                name: "Ga4DailyMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PropertyIdentifier = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    MetricDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Sessions = table.Column<int>(type: "INTEGER", nullable: false),
                    ActiveUsers = table.Column<int>(type: "INTEGER", nullable: false),
                    EngagementRate = table.Column<decimal>(type: "TEXT", precision: 7, scale: 4, nullable: false),
                    Conversions = table.Column<int>(type: "INTEGER", nullable: false),
                    Revenue = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    SyncedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ga4DailyMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ga4DailyMetrics_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ga4LandingPageMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PropertyIdentifier = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    MetricDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    LandingPage = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: false, defaultValue: ""),
                    Sessions = table.Column<int>(type: "INTEGER", nullable: false),
                    ActiveUsers = table.Column<int>(type: "INTEGER", nullable: false),
                    EngagementRate = table.Column<decimal>(type: "TEXT", precision: 7, scale: 4, nullable: false),
                    Conversions = table.Column<int>(type: "INTEGER", nullable: false),
                    Revenue = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    SyncedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ga4LandingPageMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ga4LandingPageMetrics_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OAuthNonces",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NonceHash = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ServiceType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ExpiresAt = table.Column<long>(type: "INTEGER", nullable: false),
                    ConsumedAt = table.Column<long>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OAuthNonces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OAuthNonces_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OAuthNonces_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_User_Read",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Ga4DailyMetrics_Project_Property_Date",
                table: "Ga4DailyMetrics",
                columns: new[] { "ProjectId", "PropertyIdentifier", "MetricDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ga4LandingPageMetrics_Project_Property_Date",
                table: "Ga4LandingPageMetrics",
                columns: new[] { "ProjectId", "PropertyIdentifier", "MetricDate" });

            migrationBuilder.CreateIndex(
                name: "UQ_Ga4LandingPageMetrics_Project_Property_Date_Page",
                table: "Ga4LandingPageMetrics",
                columns: new[] { "ProjectId", "PropertyIdentifier", "MetricDate", "LandingPage" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OAuthNonces_Lookup",
                table: "OAuthNonces",
                columns: new[] { "NonceHash", "ConsumedAt", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OAuthNonces_ProjectId",
                table: "OAuthNonces",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_OAuthNonces_UserId",
                table: "OAuthNonces",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ_OAuthNonces_Hash",
                table: "OAuthNonces",
                column: "NonceHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ga4DailyMetrics");

            migrationBuilder.DropTable(
                name: "Ga4LandingPageMetrics");

            migrationBuilder.DropTable(
                name: "OAuthNonces");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_User_Read",
                table: "Notifications");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_User_Read",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });
        }
    }
}
