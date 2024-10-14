using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Persistence.Models
{
    public class Message
    {
        public int ChatId { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime TimeStampUtc { get; set; }

        public int SenderId { get; set; }
        public User Sender { get; set; } = default!;

        public Chat Chat { get; set; } = default!;
    }
}