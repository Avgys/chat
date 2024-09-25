using chat_backend.Misc;
using chat_backend.Services;
using Microsoft.Extensions.Options;
using NLog;
using NLog.Web;
using Persistence;
using Persistence.Models;
using Shared.Misc;

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

                builder.Services.AddControllers();
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();

                builder.Services.AddDistributedMemoryCache();
                builder.Services.AddSession();

                builder.Services.AddSingleton<AppSettings>();
                builder.Services.AddScoped<AuthService>();

                builder.Services.AddPersistence(builder.Configuration);
#if DEBUG
                builder.Services.AddCors(options =>
                {
                    options.AddPolicy("AllowReactApp",
                    builder => builder
                       .WithOrigins("http://localhost:3000")
                       .AllowAnyHeader()
                       .AllowAnyMethod());
                });
#endif
                builder.Services.AddAuthentication().AddCookie(AuthConsts.AuthScheme, options =>
                {
                    options.ExpireTimeSpan = TimeSpan.FromDays(1);
                    options.Cookie.Name = AuthConsts.CookieName;
                    options.LoginPath = "/api/auth/login";
                });

                builder.Services.AddAuthorization(options =>
                {
                    options.AddPolicy(Auth.UserPolicy, policy => policy.RequireClaim(AuthConsts.RoleClaim, Role.Client));
                });

                var app = builder.Build();

                if (app.Environment.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI();
                }

                app.UseCors("AllowReactApp");

                app.UseHttpsRedirection();
                app.UseSession();

                app.UseAuthentication();
                app.UseAuthorization();

                app.MapControllers();


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
