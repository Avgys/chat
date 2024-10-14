using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shared.Misc;

namespace Shared.BuilderConfig
{
    public static class CommonServices
    {
        private static string[] _allowedCorsHeaders = ["Authorization", "x-signalr-user-agent", "x-requested-with", "content-type"];
        private static string[] _allowedClientOrigins = ["http://localhost:3000", "https://localhost:3000"];

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
                   .WithOrigins(_allowedClientOrigins)
                   .WithMethods("GET", "POST")
                   .WithHeaders(_allowedCorsHeaders)
                   .AllowCredentials());
            });
#endif
            //Prevent controllers sharing between libraries
            //services.AddControllers()
            //    .PartManager.ApplicationParts.Clear();

            //Include controllers only from start assembly
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = null;
                    options.JsonSerializerOptions.IncludeFields = true;
                });
            // .PartManager.ApplicationParts.Add(new AssemblyPart(Assembly.GetEntryAssembly()!));

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
