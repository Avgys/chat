using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class RefreshToken
    {
        [Key]
        public Guid TokenId { get; set; } = default!;
        [Required]
        public int UserId { get; set; } = default!;
        [Required]
        public DateTime ExpirationDateUtc {get;set;}

        public User User { get; set; } = default!;
    }
}
