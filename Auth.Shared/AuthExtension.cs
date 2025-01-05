using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Auth.Shared
{
    public static class AuthExtension
    {
        public static void AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration, Action<JwtBearerOptions>? additinalConfiguration = null)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
               .AddJwtBearer(options =>
               {
                   options.TokenValidationParameters = new TokenValidationParameters
                   {
                       ValidateIssuer = true,
                       ValidateAudience = true,
                       ValidateLifetime = true,
                       ValidateIssuerSigningKey = true,
                       ValidIssuer = configuration["Jwt:Issuer"]!,
                       ValidAudience = configuration["Jwt:Audience"]!,
                       IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
                   };

                   additinalConfiguration?.Invoke(options);
               });
        }
    }
}
