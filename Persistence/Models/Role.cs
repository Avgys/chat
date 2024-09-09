using System.ComponentModel.DataAnnotations;

namespace Persistence.Models
{
    public class Role
    {
        public static string User = "User";
        public static string Admin = "Admin";

        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = default!;
    }
}
