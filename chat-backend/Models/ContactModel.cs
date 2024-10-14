namespace chat_backend.Models
{
    public record struct ContactModel
    {
        public int? UserId;
        public int? ChatId;
        public string Name;
        public string AvatarSrc;
        public string LastMessage;
        public DateTime Time;
    }
}
