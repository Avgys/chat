using FluentMigrator;

namespace Persistence.Migrations
{
    [Migration(05)]
    public class AddedRefreshToken : Migration
    {
        public override void Up()
        {
            Create.Table("RefreshTokens")
                .WithColumn("TokenId").AsGuid().PrimaryKey().NotNullable()
                .WithColumn("UserId").AsInt32().NotNullable().ForeignKey("Users", "Id").OnDeleteOrUpdate(System.Data.Rule.Cascade)
                .WithColumn("ExpirationDateUtc").AsDateTime().NotNullable();
        }

        public override void Down()
        {
            Delete.Table("RefreshTokens");
        }
    }
}
