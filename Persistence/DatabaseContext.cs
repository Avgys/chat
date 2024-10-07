using Microsoft.EntityFrameworkCore;
using Persistence.Models;

namespace Persistence
{
    public class DatabaseContext : DbContext
    {
        public DbSet<Message> Messages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatToUser> ChatToUser { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Chat>()
                .HasMany(x => x.Messages)
                .WithOne(x => x.Chat)
                .HasForeignKey(x => x.ChatId);

            modelBuilder.Entity<Role>()
                .HasMany<User>()
                .WithOne(x => x.Role)
                .HasForeignKey(x => x.RoleId);

            modelBuilder.Entity<User>()
                .HasMany<RefreshToken>()
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId);
        }
    }
}
