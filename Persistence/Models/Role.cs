using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class Role
    {
        public const string Client = "Client";
        public const string Admin = "Admin";

        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = default!;
    }
}
