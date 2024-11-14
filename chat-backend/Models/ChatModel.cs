namespace chat_backend.Models
{
    public record struct ChatModel 
    {
        public int ChatId;
        public string Name;
        public ContactModel[] Participants;
    }
}
