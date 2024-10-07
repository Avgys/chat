using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public string ClientHashSalt { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;

        public int RoleId { get; set; }
        public Role Role { get; set; } = default!;
    }
}
