using System.ComponentModel.DataAnnotations;

namespace chat_backend.Models
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
}
