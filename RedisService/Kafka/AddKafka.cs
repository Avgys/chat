using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Repositories.Kafka
{
    public static class KafkaExtension
    {
        const string ConnectionKey = "Kafka";

        public static IServiceCollection AddKafkaConsumer(this IServiceCollection services, 
            IConfiguration configuration)
        {
            var config = new ConsumerConfig
            {
                BootstrapServers = configuration.GetConnectionString(ConnectionKey),
                GroupId = "message-consumer",
                AutoOffsetReset = AutoOffsetReset.Earliest
            };

            services.AddSingleton(new ConsumerBuilder<string, string>(config).Build());

            return services;
        }

        public static IServiceCollection AddKafkaProducer(this IServiceCollection services, 
            IConfiguration configuration)
        {
            var config = new ConsumerConfig
            {
                BootstrapServers = configuration.GetConnectionString(ConnectionKey),
                ClientId = "message-producer",
            };

            services.AddSingleton(new ProducerBuilder<string, string>(config).Build());

            return services;
        }
    }
}

