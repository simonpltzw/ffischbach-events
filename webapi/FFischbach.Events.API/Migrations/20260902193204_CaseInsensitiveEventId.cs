using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FFischbach.Events.API.Migrations
{
    /// <inheritdoc />
    public partial class CaseInsensitiveEventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:citext", ",,");
            
            // 1. Alle betroffenen FKs droppen
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Events_EventId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Events_EventId",
                table: "Groups");

            // 2. Typ anpassen
            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "Groups",
                type: "citext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Events",
                type: "citext",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "EventManagers",
                type: "citext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)");

            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "Categories",
                type: "citext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)");
            
            // 3. Forein-keys wiederherstellen
            migrationBuilder.AddForeignKey(
                name: "FK_Category_Events_EventId",
                table: "Categories",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.AddForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Events_EventId",
                table: "Groups",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:citext", ",,");

            // 1. Alle betroffenen FKs droppen
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Events_EventId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Events_EventId",
                table: "Groups");

            // 2. Typ anpassen
            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "Groups",
                type: "character varying(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "citext");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Events",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "citext",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "EventManagers",
                type: "character varying(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "citext");

            migrationBuilder.AlterColumn<string>(
                name: "EventId",
                table: "Categories",
                type: "character varying(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "citext");
            
            // 3. Forein-keys wiederherstellen
            migrationBuilder.AddForeignKey(
                name: "FK_Category_Events_EventId",
                table: "Categories",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.AddForeignKey(
                name: "FK_EventManagers_Events_EventId",
                table: "EventManagers",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Events_EventId",
                table: "Groups",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
