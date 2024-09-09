using System.ComponentModel.DataAnnotations;

namespace chat_backend
{
    public class AuthModel
    {
        [Required]
        [StringLength(100, MinimumLength = 4)]
        public string Name { get; set; } = string.Empty;
        public string? ClientSalt { get; set; }
        [Required]
        [StringLength(64, MinimumLength = 10)]
        public string ClientPasswordHash { get; set; } = string.Empty;
        public bool IsStaySignIn { get; set; } = false;
    }
}
