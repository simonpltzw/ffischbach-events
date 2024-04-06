using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FFischbach.Events.API.Migrations
{
    /// <inheritdoc />
    public partial class RemovePrivateKeyHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventManager_Events_EventId",
                table: "EventManager");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EventManager",
                table: "EventManager");

            migrationBuilder.DropColumn(
                name: "PrivateKeyHash",
                table: "Events");

            migrationBuilder.RenameTable(
                name: "EventManager",
                newName: "EventManagers");

            migrationBuilder.RenameIndex(
                name: "IX_EventManager_EventId",
                table: "EventManagers",
                newName: "IX_EventManagers_EventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EventManagers",
                table: "EventManagers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EventManagers",
                table: "EventManagers");

            migrationBuilder.RenameTable(
                name: "EventManagers",
                newName: "EventManager");

            migrationBuilder.RenameIndex(
                name: "IX_EventManagers_EventId",
                table: "EventManager",
                newName: "IX_EventManager_EventId");

            migrationBuilder.AddColumn<string>(
                name: "PrivateKeyHash",
                table: "Events",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EventManager",
                table: "EventManager",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EventManager_Events_EventId",
                table: "EventManager",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
