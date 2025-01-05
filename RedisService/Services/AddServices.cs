using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Repositories.Services
{
    public static class AddServices
    {
        public static void AddChatServices(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddRedis(configuration);
            serviceCollection.AddScoped<RedisService>();
            serviceCollection.AddScoped<ChatService>();
        }
    }
}
