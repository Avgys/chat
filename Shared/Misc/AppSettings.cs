using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace Shared.Misc
{
    public class AppSettings(IConfiguration configuration)
    {
        public string ConnectionDbPath { get; private set; } = configuration[nameof(ConnectionDbPath)] ?? default!;
        public JwtInfo JwtInfo { get; private set; } = new JwtInfo(configuration);
    }

    public class JwtInfo
    {
        public string Issuer { get; private set; }
        public string Audience { get; private set; }
        public byte[] Key { get; private set; }

        public JwtInfo(IConfiguration configuration)
        {
            Issuer = configuration["Jwt:Issuer"]!;
            Audience = configuration["Jwt:Audience"]!;
            Key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!);

            if (Key.Length < 32)
            {
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(Key);
                    configuration["Jwt:Key"] = Key.ToString();
                }
            }
        }
    }
}
