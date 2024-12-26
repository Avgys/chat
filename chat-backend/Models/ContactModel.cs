namespace chat_backend.Models
{
    public record ContactModel
    {
        public int? UserId { get; set; }
        public int? ChatId { get; set; }
        public bool IsStranger { get; set; }
        public string Name { get; set; } = default!;
        public string AvatarSrc { get; set; } = default!;
        public string? LastMessage { get; set; }
        public DateTime? LastMessageUTC { get; set; }
    }
}
