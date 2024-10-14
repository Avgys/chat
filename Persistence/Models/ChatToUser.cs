using Microsoft.EntityFrameworkCore;

namespace Persistence.Models
{
    [PrimaryKey(nameof(ChatId), nameof(UserId))]
    public class ChatToUser
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }

        public User User { get; set; } = default!;
        public Chat Chat { get; set; } = default!;
    }
}
