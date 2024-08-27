using chat_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace chat_backend.Data
{
    public class DatabaseContext : DbContext
    {
        DbSet<Message> messages;
        DbSet<User> users;

        public DatabaseContext() { 
        
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql();
        }
    }
}
