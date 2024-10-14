using FluentMigrator;

namespace Persistence.Migrations
{
    [Migration(06)]
    public class AddTestChats : Migration
    {
        public override void Up()
        {
            Insert.IntoTable("Chats")
                .Row(new { Id = 1, Name = "TestChat", IsGroup = false, Description = "Placeholder", Password = "Description" });

            Insert.IntoTable("Users")
                .Row(new { Id = 1, Name = "stringstri", RoleId = 1, ClientHashSalt = "string", PasswordHash = "AQAAAAIAAYagAAAAEGM+nafLYA92KV7ZMn5ca9L95ZznsVBtPHBZU0ZtscGgPQrC8s/9rvQHE/4AFzzVRA==" });

            Insert.IntoTable("ChatToUser")
                .Row(new { ChatId = 1, UserId = 1 });
        }

        public override void Down()
        {
            Delete.FromTable("Chats")
                .Row(new { Name = "TestChat" });
        }
    }
}
