using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Persistence.Models
{
    public class Message
    {
        [ForeignKey("Chat")]
        [Key, Column(Order = 0)]
        public int ChatId { get; set; }
        [Key, Column(Order = 1)]
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime TimeStampUtc { get; set; }

        public int SenderId { get; set; }
        public virtual User Sender { get; set; } = default!;

        public virtual Chat Chat { get; set; } = default!;
    }
}