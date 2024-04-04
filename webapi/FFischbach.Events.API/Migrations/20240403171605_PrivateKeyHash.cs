using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FFischbach.Events.API.Migrations
{
    /// <inheritdoc />
    public partial class PrivateKeyHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrivateKeyHash",
                table: "Events",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrivateKeyHash",
                table: "Events");
        }
    }
}
