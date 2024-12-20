using chat_backend.Models;

namespace chat_backend.Hubs
{
    public partial class ChatHub
    {
        public class Offer
        {
            public ContactModel Contact { get; set; } = default!;
            public string Content { get; set; } = default!;
        }
    }
}