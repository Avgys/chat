using Redis.OM.Modeling;

namespace Repositories.Models.Redis
{
    [Document(StorageType = StorageType.Json)]
    public class RedisUser
    {
        [RedisIdField][Indexed] public int Id { get; set; } = default!;
        [Indexed] public string ConnectionId { get; set; } = default!;
        [Indexed] public string[] ChatIds { get; set; } = default!;
    }
}
