using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Persistence.Models
{
    [PrimaryKey(nameof(ChatId), nameof(UserId))]
    public class ChatToUser
    {
        [Column(Order = 0)]
        public int ChatId { get; set; }
        [Column(Order = 1)]
        public int UserId { get; set; }

        public User User { get; set; } = default!;
        public Chat Chat { get; set; } = default!;
    }

    public class Chat
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsGroup { get; set; }

        public string Description { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public virtual ICollection<ChatToUser> Users { get; set; } = default!;
        public virtual ICollection<Message> Messages { get; set; } = default!;
    }
}
