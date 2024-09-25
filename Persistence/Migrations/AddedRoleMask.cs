using FluentMigrator;
using Persistence.Models;

namespace Persistence.Migrations
{
    [Migration(04)]
    public class AddedRoleMask : Migration
    {
        public override void Up()
        {
            Create.Table("Roles")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Name").AsString(32).Unique().NotNullable();

            Alter.Table("Users")
                .AddColumn("RoleId").AsInt32().NotNullable().ForeignKey("Roles", "Id")
                .OnDeleteOrUpdate(System.Data.Rule.Cascade);


            Insert.IntoTable("Roles")
                .Row(new { Name = Role.Client })
                .Row(new { Name = Role.Admin });
        }

        public override void Down()
        {
            Delete.Table("Roles");
        }
    }
}
