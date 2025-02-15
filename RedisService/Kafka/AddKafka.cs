using Confluent.Kafka;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace Repositories.Kafka
{
    public static class KafkaBuilders
    {
        const string ConnectionKey = "Kafka";

        public static ConsumerBuilder<K, V> CreateConsumer<K, V>(WebApplicationBuilder appBuilder)
        {
            var config = new ConsumerConfig
            {
                BootstrapServers = appBuilder.Configuration.GetConnectionString(ConnectionKey),
                GroupId = typeof(V).Name + "-consumer-" + appBuilder.Environment.ApplicationName,
                AutoOffsetReset = AutoOffsetReset.Earliest
            };

            return new ConsumerBuilder<K, V>(config)
                .SetValueDeserializer(new JsonDeserializer<V>());
        }

        public static ProducerBuilder<K, V> CreateProducer<K, V>(WebApplicationBuilder appBuilder)
        {
            var config = new ProducerConfig
            {
                BootstrapServers = appBuilder.Configuration.GetConnectionString(ConnectionKey),
                ClientId = typeof(V).Name + "-producer-" + appBuilder.Environment.ApplicationName,
            };

            return new ProducerBuilder<K, V>(config)
                .SetValueSerializer(new JsonSerializer<V>());
        }
    }

    public static class KafkaConsts
    {
        public const string MessageTopic = "message-topic";
    }
}