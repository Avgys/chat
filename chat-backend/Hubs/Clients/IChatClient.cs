namespace chat_backend.Hubs.Clients
{
    public interface IChatClient
    {
        public Task ReceiveMessage(string sender, string message);
    }
}
