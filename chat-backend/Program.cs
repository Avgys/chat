using Auth.Shared;
using chat_backend.HostedServices;
using NLog;
using NLog.Web;
using Persistence;
using Repositories.Kafka;
using Repositories.Services;
using Shared.BuilderConfig;
using Shared.Models;

namespace Chat.Manager
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var logger = LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();

            try
            {
                var builder = WebApplication.CreateBuilder(args);
                builder.AddAppSettingsJSONFile();

                builder.Logging.ClearProviders();
                builder.Host.UseNLog();

                builder.Services.AddSharedServices();
                builder.Services.AddSharedContollerServices();

                builder.Services.AddPersistence(builder.Configuration);

                builder.Services.AddChatServices(builder.Configuration);

                builder.Services.AddJwtAuthentication(builder.Configuration);
                builder.Services.AddAuthorization();

                builder.Services.AddSingleton(KafkaBuilders.CreateConsumer<int, MessageModel>(builder));
                builder.Services.AddHostedService<KafkaChatMessageProcesser>();

                var app = builder.Build();

                app.UseCommonContollerMiddleware();

                app.Run();
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                throw;
            }
            finally
            {
                LogManager.Shutdown();
            }
        }
    }
}
