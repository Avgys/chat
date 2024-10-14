using Microsoft.EntityFrameworkCore;
using Persistence.Models;

namespace Persistence
{
    public class DatabaseContext(DbContextOptions<DatabaseContext> options) : DbContext(options)
    {
        public DbSet<Message> Messages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatToUser> ChatToUser { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Chat>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatId);

            modelBuilder.Entity<Chat>()
                .HasOne(x => x.LastMessage)
                .WithOne()
                .HasForeignKey<Chat>(x => new { x.Id, x.LastMessageId });

            modelBuilder.Entity<Message>()
                .HasKey(m => new { m.ChatId, m.Id });

            modelBuilder.Entity<Message>()
                .Property(m => m.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<User>(e =>
            {
                e.HasMany(x => x.Chats)
                .WithMany(x => x.Users)
                .UsingEntity<ChatToUser>(
                r => r.HasOne(x=> x.Chat).WithMany().HasForeignKey(x => x.ChatId).HasPrincipalKey(x => x.Id),
                l => l.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).HasPrincipalKey(x => x.Id));

                e.HasOne(x => x.Role)
                .WithMany()
                .HasForeignKey(x => x.RoleId);

                e.HasMany<RefreshToken>()
                .WithOne(x=>x.User)
                .HasForeignKey(x => x.UserId);
            });
        }
    }
}
