using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FFischbach.Events.API.Migrations
{
    /// <inheritdoc />
    public partial class Category : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Groups",
                newName: "CategoryId");

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SignUpFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SignUpTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventId = table.Column<string>(type: "character varying(20)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Category_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CategoryId",
                table: "Groups",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Category_EventId",
                table: "Category",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Category_CategoryId",
                table: "Groups",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Category_CategoryId",
                table: "Groups");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropIndex(
                name: "IX_Groups_CategoryId",
                table: "Groups");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Groups",
                newName: "Category");
        }
    }
}
