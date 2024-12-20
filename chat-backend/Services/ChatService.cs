using chat_backend.Models;
using chat_backend.Models.RedisModels;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Models;
using System.Linq.Expressions;

namespace chat_backend.Services
{
    public class ChatService(DatabaseContext dbContext, RedisService redisService)
    {
        private readonly DatabaseContext _dbContext = dbContext;
        private readonly RedisService _redisService = redisService;

        public RedisService Online { get => _redisService; }

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
                })
                .SingleOrDefaultAsync();

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
                    Content = m.Text,
                    TimeStampUtc = m.TimeStampUtc,
                });

            return messages;
        }

        internal async Task SaveMessageAsync(Message message)
        {
            await _dbContext.Messages.AddAsync(message);
            await _dbContext.SaveChangesAsync();
        }

        internal Task<Chat[]> FindChatsAsync(Expression<Func<Chat, bool>> predicate)
        {
            return _dbContext.Chats
                .Where(predicate)
                .Include(x => x.Users)
                //.Select(x => new { x.Id, x.IsGroup, Users = x.Users.Select(y => y.Id) })
                .ToArrayAsync();
        }

        internal Task<int[]> FindChatIdsAsync(Expression<Func<ChatToUser, bool>> predicate)
        {
            return _dbContext.ChatToUser
                .Where(predicate)
                .Select(x => x.ChatId)
                .ToArrayAsync();
        }

        internal async Task<bool> IsParticipantAsync(int senderId, int chatId)
        {
            return await _redisService.IsParticipantAsync(senderId, chatId) || await _dbContext.Chats.Include(x => x.Users).AnyAsync(x => x.Id == chatId && x.Users.Any(user => user.Id == senderId));
        }

        public async Task<bool> IsGroup(int chatId)
        {
            var chat = await _redisService.Chats.FindByIdAsync(chatId.ToString());

            if (chat != null)
                return chat.IsGroup;

            var chats = await _dbContext.Chats
                .Where(x => x.Id == chatId)
                .Select(x => x.IsGroup)
                .ToArrayAsync();

            if (chats.Length == 0)
                throw new KeyNotFoundException($"No chat with {chatId}");

            return chats[0];
        }

        private async Task<IChat?> FindExistingChatAsync(int callerId, int userId)
        {
            var directChat = (await _redisService.Chats
                .Where(x => !x.IsGroup
                                && x.Participants.Any(y => y.UserId == callerId)
                                && x.Participants.Any(y => y.UserId == userId))
                .ToArrayAsync())
                .SingleOrDefault();

            if (directChat != null)
            {
                if (directChat.Participants.Length < 2)
                    throw new ArgumentException("Chat cannot contain less than 2 users");

                return directChat;
            }

            return await _dbContext.Chats
                .Include(x => x.Users)
                .SingleOrDefaultAsync(x => !x.IsGroup
                                            && x.Users.Any(x => x.Id == callerId)
                                            && x.Users.Any(x => x.Id == userId));
        }

        internal async Task<int> GetOrAddDirectChatAsync(int callerId, int userId)
        {
            var chat = await FindExistingChatAsync(callerId, userId);

            if (chat != null)
                return chat.Id;

            var createdChat = await CreateDirectChatAsync(callerId, userId);
            
            await Online.LoadAndJoinChat(createdChat, callerId, userId);

            return createdChat.Id;
        }

        private async Task<Chat> CreateDirectChatAsync(int callerId, int userId)
        {
            var users = (await _dbContext.Users
                  .Where(x => x.Id == callerId || x.Id == userId)
                  //.Select(x => x.Id)   //Uneccessary optimization to reduce fetched data              
                  .ToListAsync());
            //.Select(x => new User() { Id = x })
            //.ToList();

            if (users.Count != 2)
                throw new ArgumentException($"There less or more than 2 existing users for direct chat of users {callerId} and {userId}");

            //TODO Add restrictions
            var chat = new Chat { Name = $"DirectChat: {string.Join('|', users.Select(x => x.Name))}", IsGroup = false, Users = users };
            await _dbContext.Chats.AddAsync(chat);
            await _dbContext.SaveChangesAsync();

            return chat;
        }

        internal async Task<IEnumerable<string>> JoinOrLoadChatsAsync(int userId, string connectionId)
        {
            var chatIds = (await FindChatIdsAsync(x => x.UserId == userId))
               .Select(x => x.ToString())
               .ToArray();

            var redisUser = new RedisUser { Id = userId, ChatIds = chatIds, ConnectionId = connectionId };

            var chatsInfo = await _redisService.Chats.FindByIdsAsync(chatIds);

            var loadedChats = chatsInfo.Where(x => x.Value != null).Select(x => x.Value!);
            var unloadedChats = chatsInfo.Where(x => x.Value == null).Select(x => int.Parse(x.Key));

            if (loadedChats.Any())
                await _redisService.UpdateLoadedChatsAsync(loadedChats, userId, true);

            if (unloadedChats.Any())
                await LoadChatsAsync(unloadedChats, userId);

            await _redisService.Users.InsertAsync(redisUser);

            return chatIds.Select(x => x.ToString());
        }

        async Task LoadChatsAsync(IEnumerable<int> unloadedChats, int userId)
        {
            var dbChats = await FindChatsAsync(x => unloadedChats.Contains(x.Id));
            var redisChats = dbChats.Select(x => new RedisChat(x));
            foreach (var chat in redisChats)
                chat.UpdateParticipant(userId, true);

            await _redisService.Chats.InsertAsync(redisChats);
        }

        internal async Task<ContactModel?> GetUserContactByIdAsync(int? userId)
        {
            var user = await _dbContext.Users
                .Where(x => x.Id == userId)
                .Select(x => new
                {
                    x.Id,
                    x.Name,                   
                    AvatarSrc = "ImageSrcPlate"
                })
                .SingleOrDefaultAsync();

            if (user == null)
                return null;

            ContactModel contact = new()
            {
                UserId = user.Id,
                Name = user.Name,
                AvatarSrc = user.AvatarSrc,
                IsStranger = false,
            };

            return contact;
        }
    }
}
