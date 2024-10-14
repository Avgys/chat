using AuthService.BuilderConfig;
using AuthService.Services;
using NLog;
using NLog.Web;
using Persistence;
using Shared.BuilderConfig;

namespace AuthService;

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

            builder.Services.AddControllers()
                  .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<AuthenticateService>();

            var app = builder.Build();

            app.UseCommonMiddleware();

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
