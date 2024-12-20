using Microsoft.OpenApi.Validations;
using Persistence.Models;
using Redis.OM.Modeling;

namespace chat_backend.Models.RedisModels
{
    [Document(StorageType = StorageType.Json)]
    public class RedisChat : IChat
    {
        [RedisIdField]
        [Indexed] public int Id { get; set; } = default!;
        [Indexed] public bool IsGroup { get; set; }
        [Indexed(CascadeDepth = 1)] public ChatParticipant[] Participants { get; set; } = default!;

        public RedisChat() { }

        public RedisChat(Chat dbChat)
        {
            Id = dbChat.Id;
            IsGroup = dbChat.IsGroup;
            Participants = dbChat.Users.Select(y => new ChatParticipant
            {
                UserId = y.Id,
                IsActive = false,
            }).ToArray();
        }

        public void UpdateParticipant(int userId, bool isActive)
        {
            var user = Participants.SingleOrDefault(x => x.UserId == userId);
            if (user != null)
                user.IsActive = isActive;
        }
    }

    public class ChatParticipant
    {
        [RedisIdField][Indexed] public int UserId { get; set; } = default!;
        [Indexed] public bool IsActive { get; set; }
    }
}