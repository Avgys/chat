using Persistence.Models;
using Redis.OM.Modeling;

namespace chat_backend.Models.RedisModels
{
    [Document(StorageType = StorageType.Json)]
    public class RedisChat
    {
        [RedisIdField]
        [Indexed] public int Id { get; set; } = default!;
        [Indexed] public bool IsGroup { get; set; }
        [Indexed(CascadeDepth = 1)] public ChatParticipant[] Users { get; set; } = default!;

        public RedisChat() { }

        public RedisChat(Chat dbChat)
        {
            Id = dbChat.Id;
            IsGroup = dbChat.IsGroup;
            Users = dbChat.Users.Select(y => new ChatParticipant
            {
                UserId = y.Id,
                IsActive = false
            }).ToArray();
        }

        public RedisChat(Chat dbChat, int firstInitiatorId)
        {
            Id = dbChat.Id;
            IsGroup = dbChat.IsGroup;
            Users = dbChat.Users.Select(y => new ChatParticipant
            {
                UserId = y.Id,
                IsActive = firstInitiatorId == y.Id
            }).ToArray();
        }
    }

    public class ChatParticipant
    {
        [RedisIdField][Indexed] public int UserId { get; set; } = default!;
        [Indexed] public bool IsActive { get; set; }
    }
}