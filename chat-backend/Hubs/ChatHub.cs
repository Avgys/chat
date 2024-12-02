using Auth.Shared.Misc;
using chat_backend.Hubs.Clients;
using chat_backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Persistence.Models;

namespace chat_backend.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public partial class ChatHub : Hub<IChatClient>
    {
        private string UserId => Context.User!.Claims.Single(x => x.Type == AuthConsts.Claims.UserId).Value;

        public override async Task OnConnectedAsync()
        {
            await UserConnectsAsync(int.Parse(UserId));
            await base.OnConnectedAsync();
            return;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await UserDisconnectsAsync(int.Parse(UserId));
            await base.OnDisconnectedAsync(exception);
            return;
        }

        public async Task<int> SendDirectMessage(DirectMessageModel model)
        {
            var senderId = int.Parse(UserId);
            var chatId = await FindDirectChatAsync(senderId, model.ReceiverId);

            await Clients
                .Group(chatId.ToString())
                .ReceiveMessageAsync(new ChatMessageModel
                {
                    ChatId = chatId,
                    SenderId = senderId,
                    Text = model.Text,
                    TimeStampUtc = DateTime.UtcNow
                });

            await SaveMessageAsync(new Message
            {
                ChatId = chatId,
                SenderId = senderId,
                Text = model.Text,
                TimeStampUtc = DateTime.UtcNow,
            });

            return chatId;
        }

        public async Task<int> SendChatMessage(ChatMessageModel model)
        {
            var senderId = int.Parse(UserId);
            var chatId = model.ChatId;
            var hasAccess = await IsParticipantAsync(senderId, chatId);

            if (!hasAccess)
                throw new AccessViolationException("User not allowed to chat");

            await Clients
                .Group(model.ChatId.ToString())
                .ReceiveMessageAsync(new ChatMessageModel
                {
                    ChatId = chatId,
                    SenderId = senderId,
                    Text = model.Text,
                    TimeStampUtc = DateTime.UtcNow
                });

            await SaveMessageAsync(new Message
            {
                ChatId = chatId,
                SenderId = senderId,
                Text = model.Text,
                TimeStampUtc = DateTime.UtcNow,
            });

            return chatId;
        }
    }
}