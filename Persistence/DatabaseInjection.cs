using FluentMigrator;
using FluentMigrator.Runner;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using NLog.Web;
using System.Reflection;

namespace Persistence
{
    public static class DatabaseInjection
    {
        public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContextFactory<DatabaseContext>(
                options => options.UseNpgsql(configuration.GetConnectionString("ConnectionDbPath"),
                    o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery)));

            services.AddScoped(s => s.GetRequiredService<IDbContextFactory<DatabaseContext>>().CreateDbContext());

            services.AddMigrations(configuration);
            return services;
        }

        private static IServiceCollection AddMigrations(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddFluentMigratorCore()
                .ConfigureRunner(rb => rb
                .AddPostgres11_0()
                .WithGlobalConnectionString(configuration.GetConnectionString("ConnectionDbPath"))
                .ScanIn(Assembly.GetExecutingAssembly()).For.Migrations().For.EmbeddedResources())
                .AddLogging(lb => lb.AddFluentMigratorConsole())
                .AddLogging(lb => lb.AddNLog());

            using var scope = services.BuildServiceProvider(false).CreateScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Migration>>();

            var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
            logger.LogInformation("This is connection string: " +configuration.GetConnectionString("ConnectionDbPath"));

            runner.MigrateUp();

            logger.LogInformation("Migrations delivered successfully");

            return services;
        }
    }
}
