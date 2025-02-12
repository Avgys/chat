using Chat.SignalR.Hubs;
using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;

namespace Repositories.HostedServices.Kafka
{
    public class KafkaMessageBuffer(IConsumer<string, string> consumer, IHubContext<ChatHub> hub) : IHostedService
    {

        public Task StartAsync(CancellationToken cancellationToken)
        {
            consumer.Subscribe("messages");

            Task.Run(() =>
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = consumer.Consume(cancellationToken);
                        if (consumeResult is null)
                            return;

                        //var orderDetails = JsonConvert.DeserializeObject<OrderDetails>(consumeResult.Message.Value);
                        Console.WriteLine(consumeResult);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e.Message, e);
                    }
                }
            }, cancellationToken);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
