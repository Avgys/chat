using FluentMigrator;

namespace Persistence.Migrations
{
    [Migration(02)]
    public class ExtendChatMigration : Migration
    {
        public override void Up()
        {
            Alter.Table("Chats")
                .AddColumn("Description").AsString(64)
                .AddColumn("Password").AsString(64);
        }

        public override void Down()
        {
            Delete.Column("Description")
                .Column("Password").FromTable("Chats");
        }
    }
}
