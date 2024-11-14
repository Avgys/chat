using chat_backend.Controllers;
using chat_backend.Models.RedisModels;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Models;
using Redis.OM.Searching;
using System;
using System.Linq;

namespace chat_backend.Hubs
{
    public partial class ChatHub(DatabaseContext dbContext, IRedisCollection<RedisUser> users, IRedisCollection<RedisChat> chats)
    {
        private readonly DatabaseContext _dbContext = dbContext;
        private readonly IRedisCollection<RedisUser> _activeUsers = users;
        private readonly IRedisCollection<RedisChat> _activeChats = chats;

        public async Task UserConnectsAsync(int userId)
        {
            //TODO Add count contraint
            var chatIds = await _dbContext.ChatToUser
                .Where(x => x.UserId == userId)
                .Select(x => x.ChatId.ToString())
                .ToArrayAsync();

            await JoinRedisChatsAsync(chatIds);

            foreach (var chatId in chatIds)
                await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());

            async Task JoinRedisChatsAsync(string[] chatIds)
            {
                var chatsInfo = await _activeChats.FindByIdsAsync(chatIds);

                var loadedChats = chatsInfo.Where(x => x.Value != null).Select(x => x.Value!);
                var unloadedChats = chatsInfo.Where(x => x.Value == null).Select(x => int.Parse(x.Key));

                if (loadedChats.Any())
                    await UpdateChatsUserStatusAsync(loadedChats, userId, true);

                if (unloadedChats.Any())
                    await CreateAndJoinAsync(unloadedChats, userId);

                var user = new RedisUser { Id = userId, ChatIds = chatIds, ConnectionId = Context.ConnectionId };
                await _activeUsers.InsertAsync(user);
            }

            async Task CreateAndJoinAsync(IEnumerable<int> unloadedChats, int userId)
            {
                var dbChats = await _dbContext.Chats
                    .Where(x => unloadedChats.Contains(x.Id))
                    .Include(x => x.Users)
                    //.Select(x => new { x.Id, x.IsGroup, Users = x.Users.Select(y => y.Id) })
                    .ToArrayAsync();

                var redisChats = dbChats.Select(x => new RedisChat(x, userId));

                await _activeChats.InsertAsync(redisChats);
            }
        }

        private async Task UpdateChatsUserStatusAsync(IEnumerable<RedisChat> chats, int userId, bool isJoining)
        {
            foreach (var loadedChat in chats)
            {
                var index = Array.FindIndex(loadedChat!.Users, x => x.UserId == userId);
                loadedChat!.Users[index].IsActive = isJoining;
            }

            await _activeChats.UpdateAsync(chats);
        }


        internal async Task UserDisconnectsAsync(int userId)
        {
            var user = await _activeUsers.FindByIdAsync(userId.ToString());

            if (user == null)
                return;

            foreach (var chatId in user.ChatIds)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());

            var chats = (await _activeChats.FindByIdsAsync(user.ChatIds)).Select(x => x.Value!);

            var chatsToDelete = new List<RedisChat>();
            var chatsToUpdate = new List<RedisChat>();

            foreach (var chat in chats)
            {
                if (chat.Users.Count(y => y.IsActive) <= 1)
                    chatsToDelete.Add(chat);
                else
                    chatsToUpdate.Add(chat);
            }

            if (chatsToUpdate.Any())
                await UpdateChatsUserStatusAsync(chatsToUpdate, userId, false);

            if (chatsToDelete.Any())
                await _activeChats.DeleteAsync(chatsToDelete);

            await _activeUsers.DeleteAsync(user);
        }

        public async Task<bool> IsParticipantAsync(int senderId, int chatId)
        {
            var isParticipant = await _activeChats.AnyAsync(x => x.Id == chatId
                                                                && x.Users.Any(y => y.UserId == senderId));

            if (isParticipant)
                return true;

            isParticipant = await _dbContext.Chats
              .Include(x => x.Users)
              .AnyAsync(x => x.Id == chatId
                            && x.Users.Any(user => user.Id == senderId));

            return isParticipant;
        }

        public async Task<int> FindDirectChatAsync(int senderId, int receiverId)
        {
            var directChat = (await _activeChats
                .Where(x => !x.IsGroup
                                && x.Users.Any(y => y.UserId == senderId)
                                && x.Users.Any(y => y.UserId == receiverId))
                .ToArrayAsync())
                .SingleOrDefault();


            if (directChat != null)
            {
                if (directChat.Users.Length < 2)
                    throw new ArgumentException("Chat cannot contain less than 2 users");

                return directChat.Id;
            }

            var chat = await _dbContext.Chats
                .Include(x => x.Users)
                .SingleOrDefaultAsync(x => !x.IsGroup
                                            && x.Users.Any(x => x.Id == senderId)
                                            && x.Users.Any(x => x.Id == receiverId));

            if (chat == null)
            {
                var users = (await _dbContext.Users
                    .Where(x => x.Id == senderId || x.Id == receiverId)
                    //.Select(x => x.Id)                    
                    .ToListAsync());
                //.Select(x => new User() { Id = x })
                //.ToList();

                if (users.Count != 2)
                    throw new ArgumentException($"There less or more than needed users for direct chat of users {receiverId} and {senderId}");

                //TODO Add restrictions
                chat = new Chat { Name = $"DirectChat: {string.Join('|', users.Select(x => x.Name))}", IsGroup = false, Users = users };
                await _dbContext.Chats.AddAsync(chat);
                await _dbContext.SaveChangesAsync();
            }


            var redisChat = new RedisChat(chat, senderId);
            await _activeChats.InsertAsync(redisChat);

            IEnumerable<RedisUser> activeUsers = (await _activeUsers.FindByIdsAsync(chat.Users.Select(x => x.Id.ToString())))
                .Where(x => x.Value != null)
                .Select(x => x.Value!)
                .ToArray();

            var chatIdStr = chat.Id.ToString();

            await Groups.AddToGroupAsync(Context.ConnectionId, chatIdStr);

            var secondUser = activeUsers.SingleOrDefault(x => x.Id == receiverId);
            if (secondUser != null)
               await Groups.AddToGroupAsync(secondUser.ConnectionId, chatIdStr);

            foreach (var user in activeUsers)
                user.ChatIds = [.. user.ChatIds, chatIdStr];

            await _activeUsers.UpdateAsync(activeUsers);

            return chat.Id;
        }

        internal async Task SaveMessageAsync(Message message)
        {
            //var chat = new Chat { Id = message.ChatId };
            //message.Chat = chat;
            //_dbContext.Attach(chat);
            await _dbContext.Messages.AddAsync(message);
            await _dbContext.SaveChangesAsync();
        }
    }
}
