using chat_backend.Models.RedisModels;
using Microsoft.EntityFrameworkCore;
using Persistence.Models;
using Redis.OM.Searching;

namespace chat_backend.Services
{
    public class RedisService(IRedisCollection<RedisUser> users, IRedisCollection<RedisChat> chats)
    {
        public readonly IRedisCollection<RedisUser> Users = users;
        public readonly IRedisCollection<RedisChat> Chats = chats;

        internal async Task RemoveOfflineUserFromChatsAsync(RedisUser user)
        {
            var chats = (await Chats.FindByIdsAsync(user.ChatIds))
                .Where(x => x.Value != null)
                .Select(x => x.Value!);

            foreach (var chat in chats)
                chat.UpdateParticipant(user.Id, false);

            var chatsToDelete = new List<RedisChat>();
            var chatsToUpdate = new List<RedisChat>();

            foreach (var chat in chats)
            {
                if (chat.Participants.Count(y => y.IsActive) == 0)
                    chatsToDelete.Add(chat);
                else
                    chatsToUpdate.Add(chat);
            }

            if (chatsToUpdate.Any())
                await Chats.UpdateAsync(chatsToUpdate);

            if (chatsToDelete.Any())
                await Chats.DeleteAsync(chatsToDelete);

            await Users.DeleteAsync(user);
        }

        internal Task<bool> IsParticipantAsync(int senderId, int chatId) =>
            Chats.AnyAsync(x => x.Id == chatId && x.Participants.Any(y => y.UserId == senderId));

        internal async Task LoadAndJoinChat(Chat chat, params int[] userIds)
        {
            var redisChat = new RedisChat(chat);

            IEnumerable<RedisUser> activeUsers = (await Users.FindByIdsAsync(chat.Users.Select(x => x.Id.ToString())))
                .Where(x => x.Value != null)
                .Select(x => x.Value!)
                .ToArray();

            foreach (var item in redisChat.Participants)
                item.IsActive = activeUsers.Any(y => y.Id == item.UserId);

            await Chats.InsertAsync(redisChat);

            foreach (var user in activeUsers)
                user.ChatIds = [.. user.ChatIds, redisChat.Id.ToString()];

            await Users.UpdateAsync(activeUsers);
        }

        internal async Task UpdateLoadedChatsAsync(IEnumerable<RedisChat> loadedChats, int userId, bool isActive)
        {
            foreach (var loadedChat in loadedChats)
                loadedChat.UpdateParticipant(userId, isActive);

            await Chats.UpdateAsync(loadedChats);
        }
    }
}
