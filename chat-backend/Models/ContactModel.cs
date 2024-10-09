namespace chat_backend.Models
{
    public record struct ContactModel
    {
        public int Id;
        public string Name;
        public string AvatarSrc;
        public string LastMessage;
        public string Time;
    }
}
