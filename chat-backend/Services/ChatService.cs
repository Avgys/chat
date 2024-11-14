using chat_backend.Models;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace chat_backend.Services
{
    public class ChatService(DatabaseContext dbContext)
    {
        private readonly DatabaseContext _dbContext = dbContext;

        public async Task<IEnumerable<ContactModel>> GetLastChats(int userId, string nameFilter, int count, int skipCount)
        {
            var participaintInChats = _dbContext.ChatToUser
                .Where(x => x.UserId == userId)
                .Include(x => x.Chat)
                    .ThenInclude(ch => ch.Users)
                .Include(x => x.Chat)
                    .ThenInclude(ch => ch.Messages)
                .Select(x => new
                {
                    Name = x.Chat.IsGroup ? x.Chat.Name : x.Chat.Users.Where(u => u.Id != userId).Single().Name,
                    x.ChatId,
                    UserId = x.Chat.IsGroup ? -1 : x.Chat.Users.Where(u => u.Id != userId).Single().Id,
                    AvatarSrc = "ImageSrcPlate",
                    LastMessage = x.Chat.Messages
                    .OrderByDescending(x => x.Id).Select(x => new { x.Id, x.Text, x.TimeStampUtc })
                    .FirstOrDefault()
                });

            if (!string.IsNullOrWhiteSpace(nameFilter))
                participaintInChats = participaintInChats.Where(x => x.Name.Contains(nameFilter));

            var fetchedChats = await participaintInChats
                .OrderBy(x => x.ChatId)
                .ThenBy(x => x.UserId)
                .Skip(skipCount)
                .Take(count)
                .OrderBy(x => x.Name)
                .ToArrayAsync();

            var chatModels = fetchedChats.Select(x => new ContactModel
            {
                UserId = x.UserId,
                ChatId = x.ChatId,
                Name = x.Name,
                AvatarSrc = x.AvatarSrc,
                LastMessage = x.LastMessage?.Text,
                LastMessageUTC = x.LastMessage?.TimeStampUtc,
                IsStranger = false
            });

            return chatModels;
        }

        public async Task<IEnumerable<ContactModel>> GetContactsByName(string nameFilter, int count, int skipCount, int[]? ignoreUsers, int[]? ignoreChats)
        {
            var userContacts = _dbContext.Users.AsQueryable();
            var chatContacts = _dbContext.Chats.AsQueryable();

            if (ignoreUsers?.Length > 0)
                userContacts = userContacts.Where(x => !ignoreUsers.Contains(x.Id));

            if (ignoreChats?.Length > 0)
                chatContacts = chatContacts.Where(x => !ignoreChats.Contains(x.Id));

            if (!string.IsNullOrWhiteSpace(nameFilter))
            {
                userContacts = userContacts.Where(x => x.Name.Contains(nameFilter));
                chatContacts = chatContacts.Where(x => x.IsGroup && x.Name.Contains(nameFilter));
            }

            var fetchedData = await userContacts
                .Select(x => new
                {
                    ChatId = -1,
                    UserId = x.Id,
                    x.Name,
                    AvatarSrc = "ImageSrcPlate",
                })
                .Union(
                    chatContacts.Select(x => new
                    {
                        ChatId = x.Id,
                        UserId = -1,
                        x.Name,
                        AvatarSrc = "ImageSrcPlate",
                    })
                )
                .Skip(skipCount)
                .Take(count)
                .ToArrayAsync();


            var contacts = fetchedData.Select(x => new ContactModel
            {
                UserId = x.UserId != -1 ? x.UserId : null,
                ChatId = x.ChatId != -1 ? x.ChatId : null,
                Name = x.Name,
                AvatarSrc = x.AvatarSrc,
                IsStranger = true,
            });

            return contacts;
        }

        public async Task<ContactModel?> GetChatContactByIdAsync(int userId, int chatId)
        {
            var chat = await _dbContext.Chats
                .Include(x => x.Users)
                .Where(x => x.Id == chatId && x.Users.Any(y => y.Id == userId))
                .Include(x => x.Messages)
                .Select(x => new
                {
                    Name = x.IsGroup ? x.Name : x.Users.Where(u => u.Id != userId).Single().Name,
                    x.Id,
                    UserId = x.IsGroup ? -1 : x.Users.Where(u => u.Id != userId).Single().Id,
                    AvatarSrc = "ImageSrcPlate",
                    LastMessage = x.Messages
                        .OrderByDescending(x => x.Id)
                        .Select(x => new { x.Id, x.Text, x.TimeStampUtc })
                        .FirstOrDefault()
                }).SingleOrDefaultAsync();

            if (chat == null)
                return null;

            ContactModel contact = new()
            {
                ChatId = chat.Id,
                UserId = chat.UserId == -1 ? null : chat.UserId,
                Name = chat.Name,
                AvatarSrc = chat.AvatarSrc,
                IsStranger = false,
                LastMessage = chat.LastMessage?.Text,
                LastMessageUTC = chat.LastMessage?.TimeStampUtc
            };

            return contact;
        }

        internal async Task<IEnumerable<ChatMessageModel>> GetMessages(int userId, int chatId, int count, int skipCount)
        {
            var fetchedData = await _dbContext.ChatToUser
                .Where(x => x.UserId == userId && x.ChatId == chatId)
                .Include(x => x.Chat)
                .ThenInclude(x => x.Messages)
                .SelectMany(x => x.Chat.Messages)
                .OrderByDescending(x => x.Id)
                .Select(m => new
                {
                    m.Id,
                    m.ChatId,
                    m.SenderId,
                    m.Text,
                    m.TimeStampUtc,
                })
                .Skip(skipCount)
                .Take(count)
                .ToArrayAsync();

            var messages = fetchedData
                .OrderBy(x => x.Id)
                .Select(m => new ChatMessageModel
                {
                    Id = m.Id,
                    ChatId = m.ChatId,
                    SenderId = m.SenderId,
                    Text = m.Text,
                    TimeStampUtc = m.TimeStampUtc,
                });

            return messages;
        }
    }
}
