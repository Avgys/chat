using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Redis.OM;
using Repositories.Models.Redis;

namespace Repositories.HostedServices
{
    public class IndexCreationService : IHostedService
    {
        //Its done that so service runs immediately after app start,
        //not waiting for RedisProvider to initiate
        private readonly IServiceProvider _serviceProvider;
        public IndexCreationService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var redisProvider = scope.ServiceProvider.GetRequiredService<RedisConnectionProvider>();

            await redisProvider.Connection.CreateIndexAsync(typeof(RedisUser));
            await redisProvider.Connection.CreateIndexAsync(typeof(RedisChat));
        }

        public Task StopAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }

    public class RedisClearService : IHostedService
    {
        //Its done that so service runs immediately after app start,
        //not waiting for RedisProvider to initiate
        private readonly IServiceProvider _serviceProvider;
        public RedisClearService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var redisProvider = scope.ServiceProvider.GetRequiredService<RedisConnectionProvider>();

            return redisProvider.Connection.ExecuteAsync("FLUSHALL");
        }

        public Task StopAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }
}
