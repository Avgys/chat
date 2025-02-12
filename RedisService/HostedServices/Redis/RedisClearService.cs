using Microsoft.Extensions.Hosting;
using Redis.OM;

namespace Repositories.HostedServices.Redis
{
    public class RedisClearService(RedisConnectionProvider redisProvider) : IHostedService
    {
        public Task StartAsync(CancellationToken cancellationToken) 
            => redisProvider.Connection.ExecuteAsync("FLUSHALL");

        public Task StopAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }
}
