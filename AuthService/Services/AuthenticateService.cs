using AuthService.Misc;
using AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Persistence;
using Persistence.Models;
using Shared.Misc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace AuthService.Services;

public class AuthenticateService(DatabaseContext databaseContext, AppSettings appSettings)
{
    private readonly PasswordHasher<string> _passwordHasher = new();
    private readonly DatabaseContext _dbContext = databaseContext;
    private readonly AppSettings _appSettings = appSettings;

    public async Task<bool> RegisterAsync(AuthModelRequest model)
    {
        if (_dbContext.Users.Any(x => x.Name == model.Name.Trim()))
            return false;

        var client = new User
        {
            Name = model.Name,
            ClientHashSalt = model.ClientSalt!,
            PasswordHash = _passwordHasher.HashPassword(default!, model.ClientPasswordHash),
            Role = _dbContext.Roles.First(x => x.Name == Role.Client)
        };

        await _dbContext.Users.AddAsync(client);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<User?> LoginAsync(AuthModelRequest model)
    {
        var client = _dbContext.Users.FirstOrDefault(x => x.Name == model.Name.Trim());

        if (client == null)
            return null;

        var result = _passwordHasher.VerifyHashedPassword(default!, client.PasswordHash, model.ClientPasswordHash);

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
            await UpdatePasswordAsync(model, client);

        return client;
    }

    private async Task UpdatePasswordAsync(AuthModelRequest model, User client)
    {
        client.PasswordHash = _passwordHasher.HashPassword(default!, model.ClientPasswordHash);
        await _dbContext.SaveChangesAsync();
    }

    public string GetSalt()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(4));
    }

    public string GetSalt(string login)
    {
        return _dbContext.Users.FirstOrDefault(x => x.Name == login)?.ClientHashSalt ?? "no such user";
    }
}
