using Microsoft.AspNetCore.Identity;
using Persistence;
using Persistence.Models;
using System.Security.Cryptography;

namespace chat_backend.Services
{
    public class AuthService
    {
        private readonly PasswordHasher<string> _passwordHasher;
        private readonly DatabaseContext _dbContext;

        public AuthService(DatabaseContext databaseContext)
        {
            _passwordHasher = new();
            _dbContext = databaseContext;
        }

        public async Task<bool> Register(AuthModelRequest model)
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

        public async Task<bool> Login(AuthModelRequest model)
        {
            var client = _dbContext.Users.FirstOrDefault(x => x.Name == model.Name.Trim());

            if (client == null)
                return false;

            var result = _passwordHasher.VerifyHashedPassword(default!, client.PasswordHash, model.ClientPasswordHash);

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
                await UpdatePassword(model, client);

            return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
        }

        private async Task UpdatePassword(AuthModelRequest model, User client)
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
}
