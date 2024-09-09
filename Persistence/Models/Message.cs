using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class MessageModel
    {
        [Required]
        public int SenderId { get; set; }
        [Required]
        public int CliendId { get; set; }
        [Required]
        [StringLength(256, MinimumLength = 1)]
        public string MessageText { get; set; } = string.Empty;
    }

    public class Message
    {
        [Key]
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime TimeStampUtc { get; set; }

        public int SenderId { get; set; }
        public User Sender { get; set; } = default!;

        public int ChatId { get; set; }
        public Chat Chat { get; set; } = default!;
    }
}