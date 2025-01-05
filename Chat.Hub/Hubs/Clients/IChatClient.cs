using Shared.Models;

namespace Chat.SignalR.Hubs.Clients
{
    public interface IChatClient
    {
        public Task ReceiveMessage(MessageModel messageModel);
        public Task<MessageModel> ReceiveRequest(MessageModel offer);
    }
}
