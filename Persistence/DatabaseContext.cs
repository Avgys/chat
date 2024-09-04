using Microsoft.EntityFrameworkCore;
using Persistence.Models;
using Shared.Misc;

namespace Persistence
{
    public class DatabaseContext : DbContext
    {
        private readonly AppSettings appSettings;

        public DbSet<Message> Messages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatToUser> ChatToUser { get; set; }
        public DbSet<User> Users { get; set; }
        //public DbSet<AuthUser> AuthUser { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options, AppSettings appSettings) : base(options)
        {
            this.appSettings = appSettings;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .ToTable("Client");

            modelBuilder.Entity<Chat>()
                .ToTable("Chat")
                .HasMany(x => x.Messages)
                .WithOne(x => x.Chat)
                .HasForeignKey(x => x.ChatId);

            modelBuilder.Entity<Message>()
                .ToTable("Message");
        }
    }
}
