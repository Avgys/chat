using Auth.Shared;
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

            logger.Info("Enviromnet: " + builder.Environment.EnvironmentName);
            var appsettingsFilename = $"appsettings.{builder.Environment.EnvironmentName}.json";
            builder.Configuration.AddJsonFile(appsettingsFilename, optional: true, reloadOnChange: true);

            builder.Logging.ClearProviders();
            builder.Host.UseNLog();

            builder.Services.AddSharedServices();
            builder.Services.AddPersistence(builder.Configuration);

            builder.Services.AddControllers()
                  .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<AuthenticateService>();

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
