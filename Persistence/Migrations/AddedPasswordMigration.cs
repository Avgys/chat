using FluentMigrator;
using System.Data;

namespace Persistence.Migrations
{
    [Migration(03)]
    public class AddedPasswordMigration : Migration
    {
        public override void Up()
        {
            Alter.Table("Users")
                .AddColumn("ClientHashSalt").AsString(8).WithDefaultValue(0)
                .AddColumn("PasswordHash").AsString(84).WithDefaultValue("NotPassword");
        }

        public override void Down()
        {
            Delete.Column("Description")
                .Column("Password").FromTable("Users");
        }
    }
}
