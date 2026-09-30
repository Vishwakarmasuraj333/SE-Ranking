using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalSEO.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetitorTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Competitors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Domain = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()"),
                    UpdatedAt = table.Column<long>(type: "INTEGER", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Competitors_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitorRankResults",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CompetitorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    KeywordId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CheckDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: true),
                    PreviousPosition = table.Column<int>(type: "INTEGER", nullable: true),
                    PositionChange = table.Column<int>(type: "INTEGER", nullable: true),
                    RankedUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    ProviderName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "development"),
                    RecordedAt = table.Column<long>(type: "INTEGER", nullable: false, defaultValueSql: "SYSDATETIMEOFFSET()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitorRankResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitorRankResults_Competitors_CompetitorId",
                        column: x => x.CompetitorId,
                        principalTable: "Competitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitorRankResults_Keywords_KeywordId",
                        column: x => x.KeywordId,
                        principalTable: "Keywords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitorRankResults_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorRankResults_KeywordId",
                table: "CompetitorRankResults",
                column: "KeywordId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitorRankResults_Project_Date",
                table: "CompetitorRankResults",
                columns: new[] { "ProjectId", "CheckDate" });

            migrationBuilder.CreateIndex(
                name: "UQ_CompetitorRankResults_Competitor_Keyword_Date",
                table: "CompetitorRankResults",
                columns: new[] { "CompetitorId", "KeywordId", "CheckDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_Competitors_Project_Domain",
                table: "Competitors",
                columns: new[] { "ProjectId", "Domain" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompetitorRankResults");

            migrationBuilder.DropTable(
                name: "Competitors");
        }
    }
}
