using Microsoft.Extensions.Configuration;

namespace Shared.Misc
{
    public class AppSettings
    {
        public string ConnectionDbPath { get; set; }

        public AppSettings(IConfiguration configuration)
        {
            ConnectionDbPath = configuration[nameof(ConnectionDbPath)] ?? string.Empty;
        }
    }
}
