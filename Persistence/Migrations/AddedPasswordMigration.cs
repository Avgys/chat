using FluentMigrator;

namespace Persistence.Migrations
{
    [Migration(04)]
    public class AddedRoleMask : Migration
    {
        public override void Up()
        {
            Alter.Table("Client")
                .AddColumn("Role").AsInt32().WithDefaultValue(0);
        }

        public override void Down()
        {
            Delete.Column("Role").FromTable("Chat");
        }
    }
}
