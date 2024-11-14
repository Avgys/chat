using chat_backend.Models.RedisModels;
using Redis.OM;
using System;

namespace chat_backend.HostedServices
{
    public class IndexCreationService : IHostedService
    {
        private readonly RedisConnectionProvider _provider;
        public IndexCreationService(RedisConnectionProvider provider)
        {
            _provider = provider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _provider.Connection.CreateIndexAsync(typeof(RedisUser));
            await _provider.Connection.CreateIndexAsync(typeof(RedisChat));
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
