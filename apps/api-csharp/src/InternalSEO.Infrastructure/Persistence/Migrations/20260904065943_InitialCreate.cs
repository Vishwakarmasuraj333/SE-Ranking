using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalSEO.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            bool isSqlite = migrationBuilder.ActiveProvider == "Microsoft.EntityFrameworkCore.Sqlite";
            string defaultDateSql = isSqlite ? "CURRENT_TIMESTAMP" : "SYSDATETIMEOFFSET()";
            string textType = isSqlite ? "TEXT" : "nvarchar(max)";
            string guidType = isSqlite ? "TEXT" : "uniqueidentifier";
            string boolType = isSqlite ? "INTEGER" : "bit";
            string intType = isSqlite ? "INTEGER" : "int";
            string bigintType = isSqlite ? "INTEGER" : "bigint";
            string dateTimeOffsetType = isSqlite ? "INTEGER" : "datetimeoffset";
            string StringType(int length) => isSqlite ? "TEXT" : $"nvarchar({length})";

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Name = table.Column<string>(type: StringType(50), maxLength: 50, nullable: false),
                    NormalizedName = table.Column<string>(type: StringType(50), maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: StringType(250), maxLength: 250, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Email = table.Column<string>(type: StringType(256), maxLength: 256, nullable: false),
                    NormalizedEmail = table.Column<string>(type: StringType(256), maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: textType, nullable: false),
                    FirstName = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: StringType(50), maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: boolType, nullable: false, defaultValue: true),
                    LockoutEnd = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: true),
                    AccessFailedCount = table.Column<int>(type: intType, nullable: false),
                    LastLoginAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: true),
                    RefreshToken = table.Column<string>(type: textType, nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    UpdatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    CreatedBy = table.Column<Guid>(type: guidType, nullable: true),
                    UpdatedBy = table.Column<Guid>(type: guidType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    Name = table.Column<string>(type: StringType(200), maxLength: 200, nullable: false),
                    PrimaryDomain = table.Column<string>(type: StringType(255), maxLength: 255, nullable: false),
                    Protocol = table.Column<string>(type: StringType(10), maxLength: 10, nullable: false, defaultValue: "https://"),
                    Industry = table.Column<string>(type: textType, nullable: true),
                    CountryCode = table.Column<string>(type: StringType(2), maxLength: 2, nullable: false, defaultValue: "US"),
                    PrimaryLocation = table.Column<string>(type: textType, nullable: true),
                    LanguageCode = table.Column<string>(type: StringType(5), maxLength: 5, nullable: false, defaultValue: "en"),
                    Timezone = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false, defaultValue: "UTC"),
                    DefaultSearchEngine = table.Column<string>(type: StringType(50), maxLength: 50, nullable: false, defaultValue: "google"),
                    DefaultDevice = table.Column<string>(type: StringType(20), maxLength: 20, nullable: false, defaultValue: "desktop"),
                    Status = table.Column<int>(type: intType, nullable: false),
                    IsArchived = table.Column<bool>(type: boolType, nullable: false, defaultValue: false),
                    CreatedBy = table.Column<Guid>(type: guidType, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    UpdatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    UpdatedBy = table.Column<Guid>(type: guidType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    RoleId = table.Column<Guid>(type: guidType, nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    AssignedBy = table.Column<Guid>(type: guidType, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: bigintType, nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ActorId = table.Column<Guid>(type: guidType, nullable: false),
                    ActorEmail = table.Column<string>(type: StringType(256), maxLength: 256, nullable: false),
                    ActorRole = table.Column<string>(type: StringType(50), maxLength: 50, nullable: false),
                    ActionType = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: StringType(100), maxLength: 100, nullable: false),
                    ProjectId = table.Column<Guid>(type: guidType, nullable: true),
                    PayloadJson = table.Column<string>(type: textType, nullable: true),
                    IpAddress = table.Column<string>(type: StringType(50), maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: guidType, nullable: false),
                    ProjectId = table.Column<Guid>(type: guidType, nullable: false),
                    UserId = table.Column<Guid>(type: guidType, nullable: false),
                    AccessLevel = table.Column<int>(type: intType, nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false, defaultValueSql: defaultDateSql),
                    AssignedBy = table.Column<Guid>(type: guidType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectMembers_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_ActorId",
                table: "ActivityLogs",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_EntityType_EntityId",
                table: "ActivityLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_ProjectId_CreatedAt",
                table: "ActivityLogs",
                columns: new[] { "ProjectId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembers_ProjectId_UserId",
                table: "ProjectMembers",
                columns: new[] { "ProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembers_UserId",
                table: "ProjectMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CreatedBy",
                table: "Projects",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_PrimaryDomain",
                table: "Projects",
                column: "PrimaryDomain");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Status_IsArchived",
                table: "Projects",
                columns: new[] { "Status", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_NormalizedName",
                table: "Roles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users",
                column: "NormalizedEmail",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityLogs");

            migrationBuilder.DropTable(
                name: "ProjectMembers");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
