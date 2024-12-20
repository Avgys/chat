using chat_backend.Models;
using static chat_backend.Hubs.ChatHub;

namespace chat_backend.Hubs.Clients
{
    public interface IChatClient
    {
        public Task ReceiveMessage(ChatMessageModel messageModel);
        public Task<Offer> ReceiveOffer(Offer offer);
    }
}
