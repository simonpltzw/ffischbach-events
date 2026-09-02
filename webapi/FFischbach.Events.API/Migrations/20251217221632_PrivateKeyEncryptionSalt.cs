using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FFischbach.Events.API.Migrations
{
    /// <inheritdoc />
    public partial class PrivateKeyEncryptionSalt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrivateKeyEncryptionSalt",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrivateKeyEncryptionSalt",
                table: "Events");
        }
    }
}
