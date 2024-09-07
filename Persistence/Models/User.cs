using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Role Role { get; set; }

        public string ClientHashSalt { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
    }

    [Flags]
    public enum Role
    {
        User = 1, 
        Admin = 2
    }
}
