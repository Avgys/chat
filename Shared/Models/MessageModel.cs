using Shared.Models.ContactModels;

namespace Shared.Models
{
    public enum MessageType
    {
        ChatMessage = 0,
        IceCandidate = 1,
        Offer = 2,
        Answer,
        CloseConnection,
        MediaChange,
        Connected
    }

    public record MessageModel
    {
        public int? Id { get; set; }
        public ContactModel Contact { get; set; } = default!;
        public ContactModel Sender { get; set; } = default!;
        public string Content { get; set; } = default!;
        public DateTime TimeStampUtc { get; set; }
        public MessageType Type { get; set; }
    }
}
