using chat_backend.HostedServices;
using chat_backend.Hubs;
using chat_backend.Models.RedisModels;
using chat_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NLog;
using NLog.Web;
using Persistence;
using Persistence.Models;
using Redis.OM;
using Redis.OM.Contracts;
using Redis.OM.Searching;
using Shared.BuilderConfig;
using System.Text;

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
                builder.Services.AddPersistence(builder.Configuration);

                builder.Services.AddScoped<ChatService>();
                builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
               .AddJwtBearer(options =>
               {
                   options.TokenValidationParameters = new TokenValidationParameters
                   {
                       ValidateIssuer = true,
                       ValidateAudience = true,
                       ValidateLifetime = true,
                       ValidateIssuerSigningKey = true,
                       ValidIssuer = builder.Configuration["Jwt:Issuer"]!,
                       ValidAudience = builder.Configuration["Jwt:Audience"]!,
                       IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                   };

                   options.Events = new JwtBearerEvents
                   {
                       OnMessageReceived = context =>
                       {
                           var accessToken = context.Request.Query["access_token"];

                           var path = context.HttpContext.Request.Path;

                           if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/api/hubs/chat")))
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

                //Redis services
                builder.Services.AddHostedService<IndexCreationService>();
                builder.Services.AddSingleton(new RedisConnectionProvider(builder.Configuration.GetConnectionString("Redis")!));
                builder.Services.AddScoped(typeof(IRedisCollection<RedisUser>), s => s.GetRequiredService<RedisConnectionProvider>().RedisCollection<RedisUser>());
                builder.Services.AddScoped(typeof(IRedisCollection<RedisChat>), s => s.GetRequiredService<RedisConnectionProvider>().RedisCollection<RedisChat>());


                var app = builder.Build();

                app.UseCommonMiddleware();
                app.MapHub<ChatHub>("/api/hubs/chat");

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
