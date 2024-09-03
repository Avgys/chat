using FluentMigrator;
using System.Data;

namespace Persistence.Migrations
{
    [Migration(01)]
    public class InitialMigration : Migration
    {
        public override void Up()
        {
            Create.Table("Client")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Name").AsString(64).NotNullable().WithDefaultValue("DefaultName");

            Create.Table("Chat")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Name").AsString(64).NotNullable().WithDefaultValue("DefaultChatName")
                .WithColumn("IsGroup").AsBoolean().NotNullable().WithDefaultValue(false);

            Create.Table("ChatToUser")
                .WithColumn("ChatId").AsInt32().NotNullable()
                    .ForeignKey("Chat", "Id").OnDelete(Rule.Cascade)
                .WithColumn("UserId").AsInt32().NotNullable()
                    .ForeignKey("Client", "Id").OnDelete(Rule.Cascade);

            Create.PrimaryKey().OnTable("ChatToUser").Columns("ChatId", "UserId");

            Create.Table("Message")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Text").AsString(255).NotNullable()
                .WithColumn("TimeStampUtc").AsDateTime().NotNullable()
                .WithColumn("SenderId").AsInt32().NotNullable().ForeignKey("Client", "Id")
                .WithColumn("ChatId").AsInt32().NotNullable().ForeignKey("Chat", "Id");
                
        }

        public override void Down()
        {
            Delete.Table("Message");
            Delete.Table("ChatToUser");
            Delete.Table("Chat");
            Delete.Table("Client");
        }
    }
}
