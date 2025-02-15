using Confluent.Kafka;
using Persistence.Models;
using Repositories.Kafka;
using Repositories.Services;
using Shared.Models;

namespace chat_backend.HostedServices
{
    public class KafkaChatMessageProcesser(ConsumerBuilder<int, MessageModel> consumerBuilder, IServiceProvider services) : BackgroundService
    {
        protected override Task ExecuteAsync(CancellationToken cancellationToken)
        {
            var consumer = consumerBuilder
                .SetKeyDeserializer(Deserializers.Int32)
                .Build();

            consumer.Subscribe(KafkaConsts.MessageTopic);
            

            return Task.Run(async () =>
            {
                try
                {
                    using (var scope = services.CreateScope())
                    {
                        var chatService = scope.ServiceProvider.GetRequiredService<ChatService>();
                        while (!cancellationToken.IsCancellationRequested)
                        {
                            var consumeResult = consumer.Consume(cancellationToken);

                            if (consumeResult is null)
                                continue;

                            var chatMessage = consumeResult.Message.Value;

                            if (chatMessage.Type == MessageType.ChatMessage)
                                await chatService.SaveMessageAsync(new Message
                                {
                                    ChatId = chatMessage.Contact.ChatId!.Value,
                                    SenderId = chatMessage.Sender.UserId!.Value,
                                    Text = chatMessage.Content,
                                    TimeStampUtc = DateTime.UtcNow,
                                });
                        }
                    }
                }
                catch (ConsumeException ex)
                {
                    Console.WriteLine($"Error consuming message: {ex.Error.Reason}");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message, e);
                }
                finally
                {
                    consumer.Close();
                    consumer.Dispose();
                }
            }, cancellationToken);
        }
    }
}
