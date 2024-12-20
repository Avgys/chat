using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shared.Misc;

namespace Shared.BuilderConfig
{
    public static class CommonServices
    {
        private static string[] _allowedCorsHeaders = ["authorization", "x-signalr-user-agent", "x-requested-with", "content-type"];
        private static string[] _allowedClientOrigins = ["http://localhost:3000", "https://localhost:3000", "http://localhost:3000", "https://localhost:3001"];

        public static IServiceCollection AddSharedServices(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            services.AddSingleton<AppSettings>();

#if DEBUG
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                builder => builder
                    //.SetIsOriginAllowed(x => x.StartsWith("172") |)
                    .WithOrigins(_allowedClientOrigins)
                    .WithMethods("GET", "POST")
                    .WithHeaders(_allowedCorsHeaders)
                    .AllowCredentials());
            });
#endif
            
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = null;
                    options.JsonSerializerOptions.IncludeFields = true;
                });

            return services;
        }

        public static IApplicationBuilder UseCommonMiddleware(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowReactApp");
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            return app;
        }
    }
}
