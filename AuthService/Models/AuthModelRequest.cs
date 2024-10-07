using System.ComponentModel.DataAnnotations;

namespace AuthService.Models
{
    public class AuthModelRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 10)]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string ClientSalt { get; set; } = string.Empty;
        [Required]
        [StringLength(64, MinimumLength = 10)]
        public string ClientPasswordHash { get; set; } = string.Empty;
        public bool IsStaySignIn { get; set; } = false;
    }
}
