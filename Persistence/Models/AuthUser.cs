using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class AuthUser
    {
        [Key]
        public int Id { get; set; }
    }
}
