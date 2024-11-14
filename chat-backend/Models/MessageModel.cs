namespace chat_backend.Models
{
    public record MessageBase
    {
        public int? Id { get; set; }
        public int? SenderId { get; set; }
        public string Text { get; set; } = default!;
        public DateTime TimeStampUtc { get; set; }
    }

    public record DirectMessageModel : MessageBase
    {
        public int ReceiverId { get; set; } = default!;
    }

    public record ChatMessageModel : MessageBase
    {
        public int ChatId { get; set; } = default!;
    }
}
