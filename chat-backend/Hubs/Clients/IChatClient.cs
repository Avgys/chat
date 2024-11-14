using chat_backend.Models;

namespace chat_backend.Hubs.Clients
{
    public interface IChatClient
    {
        public Task ReceiveMessageAsync(ChatMessageModel messageModel);
    }
}
