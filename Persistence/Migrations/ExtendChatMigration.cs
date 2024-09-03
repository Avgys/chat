using FluentMigrator;
using System.Data;

namespace Persistence.Migrations
{
    [Migration(02)]
    public class ExtendChatMigration : Migration
    {
        public override void Up()
        {
            Alter.Table("Chat")
                .AddColumn("Description").AsString(64)
                .AddColumn("Password").AsString(64);

        }

        public override void Down()
        {
            Delete.Column("Description")
                .Column("Password").FromTable("Chat");
        }
    }
}
