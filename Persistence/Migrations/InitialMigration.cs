using FluentMigrator;
using System.Data;

namespace Persistence.Migrations
{
    [Migration(01)]
    public class InitialMigration : Migration
    {
        public override void Up()
        {
            Create.Table("Users")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Name").AsString(64).NotNullable().WithDefaultValue("DefaultName");

            Create.Table("Chats")
                .WithColumn("Id").AsInt32().PrimaryKey().Identity()
                .WithColumn("Name").AsString(64).NotNullable().WithDefaultValue("DefaultChatName")
                .WithColumn("LastMessageId").AsInt32().Nullable()
                .WithColumn("IsGroup").AsBoolean().NotNullable().WithDefaultValue(false);

            Create.Table("ChatToUser")
                .WithColumn("ChatId").AsInt32().NotNullable()
                    .ForeignKey("Chats", "Id").OnDeleteOrUpdate(Rule.Cascade)
                .WithColumn("UserId").AsInt32().NotNullable()
                    .ForeignKey("Users", "Id").OnDeleteOrUpdate(Rule.Cascade);

            Create.PrimaryKey().OnTable("ChatToUser").Columns("ChatId", "UserId");

            Create.Table("Messages")
                .WithColumn("ChatId").AsInt32().NotNullable().ForeignKey("Chats", "Id").OnDeleteOrUpdate(Rule.Cascade)
                .WithColumn("Id").AsInt32().Identity()
                .WithColumn("Text").AsString(255).NotNullable()
                .WithColumn("TimeStampUtc").AsDateTime().NotNullable()
                .WithColumn("SenderId").AsInt32().NotNullable().ForeignKey("Users", "Id");

            Create.PrimaryKey().OnTable("Messages").Columns("ChatId", "Id");

            Create.ForeignKey()
                .FromTable("Chats").ForeignColumns("Id", "LastMessageId")
                .ToTable("Messages").PrimaryColumns("ChatId", "Id");
        }

        public override void Down()
        {
            Delete.Table("Messages");
            Delete.Table("ChatToUser");
            Delete.Table("Chats");
            Delete.Table("Users");
        }
    }
}
