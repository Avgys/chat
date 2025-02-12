using Microsoft.Extensions.Hosting;
using Redis.OM;
using Repositories.Models.Redis;

namespace Repositories.HostedServices.Redis
{
    public class IndexCreationService(RedisConnectionProvider redisProvider) : IHostedService
    {
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await redisProvider.Connection.CreateIndexAsync(typeof(RedisUser));
            await redisProvider.Connection.CreateIndexAsync(typeof(RedisChat));
        }

        public Task StopAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }    
}
