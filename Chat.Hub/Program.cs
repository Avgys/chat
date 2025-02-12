using Auth.Shared;
using Chat.SignalR.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using NLog;
using NLog.Web;
using Persistence;
using Repositories.HostedServices.Kafka;
using Repositories.Kafka;
using Repositories.Services;
using Shared.BuilderConfig;

namespace Chat.SignalR
{
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

                builder.Services.AddChatServices(builder.Configuration);
                //builder.Services.AddHostedService<RedisClearService>();

                builder.Services.AddKafkaConsumer(builder.Configuration);
                builder.Services.AddHostedService<KafkaMessageBuffer>();

                builder.Services.AddJwtAuthentication(builder.Configuration, options =>
                {
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/hubs/chat"))
                                context.Token = accessToken;

                            return Task.CompletedTask;
                        }
                    };
                });

                builder.Services.AddAuthorization();

                builder.Services.AddSignalR()
                    .AddJsonProtocol(options =>
                    {
                        options.PayloadSerializerOptions.PropertyNameCaseInsensitive = true;
                        options.PayloadSerializerOptions.PropertyNamingPolicy = null;
                    });


                var app = builder.Build();

                app.UseCors("AllowReactApp");

                app.UseAuthentication();
                app.UseAuthorization();

                app.MapHub<ChatHub>("/api/hubs/chat")
                   .RequireCors("AllowReactApp");

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
