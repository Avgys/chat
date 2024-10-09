using AuthService.BuilderConfig;
using chat_backend.Hubs;
using NLog;
using NLog.Web;
using Persistence;
using Shared.BuilderConfig;

namespace chat_backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var logger = LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();

            try
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Logging.ClearProviders();
                builder.Host.UseNLog();

                builder.Services.AddSharedServices();
                builder.Services.AddSharedAuthServices(builder.Configuration);
                builder.Services.AddPersistence(builder.Configuration);

                builder.Services.AddSignalR();

                var app = builder.Build();

                app.AddCommonMiddleware();
                app.MapHub<ChatHub>("/hubs/chat");

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
