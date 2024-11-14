using Redis.OM.Modeling;

namespace chat_backend.Models.RedisModels
{
    [Document(StorageType = StorageType.Json)]
    public class RedisUser
    {
        [RedisIdField] [Indexed] public int Id { get; set; } = default!;
        [Indexed] public string ConnectionId { get; set; } = default!;
        [Indexed] public string[] ChatIds { get; set; } = default!;
    }
}
