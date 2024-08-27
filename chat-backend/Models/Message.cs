namespace chat_backend.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int CliendId { get; set; }
        public string MessageText { get; set; } = string.Empty;

        public List<User> Users { get; set; } = new();
    }
}
