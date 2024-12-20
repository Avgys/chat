using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Persistence.Models
{

    public class Chat : IChat
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsGroup { get; set; }

        public string Description { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public int? LastMessageId { get; set; }
        public Message? LastMessage { get; set; } = default!;

        public ICollection<User> Users { get; set; } = default!;
        public ICollection<Message> Messages { get; set; } = default!;
    }
}
