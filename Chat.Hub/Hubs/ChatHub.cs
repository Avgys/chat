using Auth.Shared.Misc;
using Chat.SignalR.Hubs.Clients;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using Persistence.Models;
using Repositories.Services;
using Shared.Models;
using Shared.Models.ContactModels;

namespace Chat.SignalR.Hubs
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

        private async Task ResendMessage(MessageModel model, MessageType messageType)
        {
            await Clients
             .GroupExcept(model.Contact.ChatId!.Value.ToString(), Context.ConnectionId)
             .ReceiveMessage(model);

            if (messageType == MessageType.ChatMessage)
                await _chatService.SaveMessageAsync(new Message
                {
                    ChatId = model.Contact.ChatId.Value,
                    SenderId = model.SenderId,
                    Text = model.Content,
                    TimeStampUtc = DateTime.UtcNow,
                });
        }

        private async Task<int> GetCommonChatIdAsync(ContactModel contact, int callerId)
        {
            var chatId = -1;

            if (contact.ChatId.HasValue)
            {
                var hasAccess = await _chatService.IsParticipantAsync(callerId, contact.ChatId.Value);

                if (!hasAccess)
                    throw new AccessViolationException("User not allowed to chat");

                chatId = contact.ChatId.Value;
            }
            else if (contact.UserId.HasValue)
            {
                chatId = await _chatService.GetOrAddDirectChatAsync(callerId, contact.UserId.Value);
                var chatIdStr = chatId.ToString();

                await Groups.AddToGroupAsync(Context.ConnectionId, chatIdStr);

                var secondUser = _chatService.Online.Users.SingleOrDefault(x => x.Id == contact.UserId.Value);
                if (secondUser != null)
                    await Groups.AddToGroupAsync(secondUser.ConnectionId, chatIdStr);
            }

            return chatId;
        }

        //Without waiting an answer from receiver(-s)
        public async Task<MessageModel> SendMessage(MessageModel model)
        {
            var senderId = int.Parse(UserId);
            model.Contact.ChatId = await GetCommonChatIdAsync(model.Contact, senderId);
            
            await ResendMessage(model, model.Type);

            return model;
        }

        //With waiting an answer from receiver(-s)
        public async Task<MessageModel> SendRequest(MessageModel offer)
        {
            var callerId = int.Parse(UserId);
            int chatId = await GetCommonChatIdAsync(offer.Contact, callerId);

            var chat = await _chatService.Online.Chats.FindByIdAsync(chatId.ToString());

            var caller = await _chatService.GetUserContactByIdAsync(int.Parse(UserId));

            offer.Contact = caller!;
            offer.Contact.ChatId = chatId;
            var receivers = chat!.Participants
                .Where(x => x.UserId != callerId && x.IsOnline)
                .ToArray();

            var receiversConnectionId = await _chatService.Online.Users
                .FindByIdsAsync(receivers
                    .Select(x => x.UserId.ToString()))
                .ContinueWith(x => x.Result
                    .Where(y => y.Value != null)
                    .Select(y => y.Value!.ConnectionId)
                    .ToArray());

            var answersTasks = new Task<MessageModel>[receiversConnectionId.Length];

            for(int i = 0; i < receiversConnectionId.Length; i++)
            {
                answersTasks[i] = Clients
                    .Client(receiversConnectionId[i].ToString())
                    .ReceiveRequest(offer);
            }

            var answers = await Task.WhenAll(answersTasks);

            return answers[0];
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