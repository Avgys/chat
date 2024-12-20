using Newtonsoft.Json.Converters;
using System.Text.Json.Serialization;

namespace chat_backend.Models
{
    public enum MessageType
    {
        ChatMessage = 0,
        IceCandidate = 1
    }

    public abstract record MessageBase
    {
        public int? Id { get; set; }
        public int SenderId { get; set; } = -1;
        public string Content { get; set; } = default!;
        public DateTime TimeStampUtc { get; set; }
        public MessageType Type { get; set; }
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
