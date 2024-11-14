using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Persistence.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public string ClientHashSalt { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;

        public int RoleId { get; set; }
        public Role Role { get; set; } = default!;

        public ICollection<Chat> Chats { get; set; } = default!;
    }
}
