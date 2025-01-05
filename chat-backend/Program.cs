using Auth.Shared;
using NLog;
using NLog.Web;
using Persistence;
using Repositories.Services;
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
                builder.AddAppSettingsJSONFile();

                builder.Logging.ClearProviders();
                builder.Host.UseNLog();

                builder.Services.AddSharedServices();
                builder.Services.AddSharedContollerServices();

                builder.Services.AddPersistence(builder.Configuration);

                builder.Services.AddChatServices(builder.Configuration);

                builder.Services.AddJwtAuthentication(builder.Configuration);
                builder.Services.AddAuthorization();

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
