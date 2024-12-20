using Auth.Shared.Misc;
using chat_backend.Hubs.Clients;
using chat_backend.Models;
using chat_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Persistence.Models;

namespace chat_backend.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public partial class ChatHub(ChatService chatService) : Hub<IChatClient>
    {
        private readonly ChatService _chatService = chatService;
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
            var chatId = await _chatService.GetOrAddDirectChatAsync(senderId, model.ReceiverId);

            var chatMessage = new ChatMessageModel
            {
                ChatId = chatId,
                SenderId = senderId,
                Content = model.Content,
                TimeStampUtc = DateTime.UtcNow
            };

            await ResendMessage(chatMessage, model.Type);

            return chatId;
        }

        public async Task<int> SendChatMessage(ChatMessageModel model)
        {
            model.SenderId = int.Parse(UserId);
            var hasAccess = await _chatService.IsParticipantAsync(model.SenderId, model.ChatId);

            if (!hasAccess)
                throw new AccessViolationException("User not allowed to chat");

            await ResendMessage(model, model.Type);

            return model.ChatId;
        }

        private async Task ResendMessage(ChatMessageModel model, MessageType messageType)
        {
            await Clients
             .GroupExcept(model.ChatId.ToString(), Context.ConnectionId)
             .ReceiveMessage(model);

            if (messageType == MessageType.ChatMessage)
                await _chatService.SaveMessageAsync(new Message
                {
                    ChatId = model.ChatId,
                    SenderId = model.SenderId,
                    Text = model.Content,
                    TimeStampUtc = DateTime.UtcNow,
                });
        }

        public async Task<Offer> StartPeerConnection(Offer offer)
        {
            var callerId = int.Parse(UserId);
            int chatId;

            if (offer.Contact.ChatId.HasValue)
            {
                chatId = offer.Contact.ChatId.Value;
                var hasAccess = await _chatService.IsParticipantAsync(callerId, chatId);

                if (!hasAccess)
                    throw new AccessViolationException("User not allowed to chat");
            }
            else
            {
                chatId = await _chatService.GetOrAddDirectChatAsync(callerId, offer.Contact.UserId!.Value);
                var chatIdStr = chatId.ToString();

                await Groups.AddToGroupAsync(Context.ConnectionId, chatIdStr);

                var secondUser = _chatService.Online.Users.SingleOrDefault(x => x.Id == offer.Contact.UserId!.Value);
                if (secondUser != null)
                    await Groups.AddToGroupAsync(secondUser.ConnectionId, chatIdStr);
            }

            var chat = await _chatService.Online.Chats.FindByIdAsync(chatId.ToString());

            if (chat == null)
                throw new KeyNotFoundException($"No chat with {chatId}");

            Offer answer;

            if (chat.IsGroup)
            {
                throw new NotImplementedException();
            }
            else
            {
                var receiveChatMember = chat.Participants.Single(x => x.UserId != callerId);
                var receiverInfo = (await _chatService.Online.Users.FindByIdAsync(receiveChatMember.UserId.ToString()))
                    ?? throw new KeyNotFoundException($"No active user in chat");

                answer = await Clients.Client(receiverInfo.ConnectionId.ToString()).ReceiveOffer(offer);
            }

            return answer;
        }

        private async Task UserConnectsAsync(int userId)
        {           
            var chatIds = await _chatService.JoinOrLoadChatsAsync(userId, Context.ConnectionId);

            foreach (var chatId in chatIds)
                await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
        }

        private async Task UserDisconnectsAsync(int userId)
        {
            var user = await _chatService.Online.Users.FindByIdAsync(userId.ToString());

            if (user == null)
                return;

            foreach (var chatId in user.ChatIds)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());

            await _chatService.Online.RemoveOfflineUserFromChatsAsync(user);
        }
    }
}