using Confluent.Kafka;
using System.Text;
using System.Text.Json;

namespace Repositories.Kafka
{
    public class JsonDeserializer<T> : IDeserializer<T>
    {
        public T Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
        {
            if (isNull)
                return default;

            var json = Encoding.UTF8.GetString(data);
            return JsonSerializer.Deserialize<T>(json);
        }
    }

    public class JsonSerializer<T> : ISerializer<T>
    {
        public byte[] Serialize(T data, SerializationContext context)
        {
            if (data == null)
                return null;

            // Convert the object to a JSON string
            var json = JsonSerializer.Serialize(data);

            // Convert the JSON string to a byte array
            return Encoding.UTF8.GetBytes(json);
        }
    }
}
