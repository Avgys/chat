using NLog;
using NLog.Web;
using Repositories.Kafka;
using Shared.BuilderConfig;
using Shared.Models;

namespace LoadBalancer
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

                builder.Services.AddReverseProxy()
                    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

                var app = builder.Build();

                app.MapReverseProxy();
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
