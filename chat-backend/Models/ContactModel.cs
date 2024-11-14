namespace chat_backend.Models
{
    public record ContactModel
    {
        public int? UserId;
        public int? ChatId;
        public bool IsStranger;
        public string Name = default!;
        public string AvatarSrc = default!;
        public string? LastMessage;
        public DateTime? LastMessageUTC;
    }
}
