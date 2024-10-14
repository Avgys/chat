using AuthService.Misc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Persistence;
using Persistence.Models;
using Shared.Misc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AuthService.Services;

public class TokenService(DatabaseContext databaseContext, AppSettings appSettings)
{
    private readonly PasswordHasher<string> _passwordHasher = new();
    private readonly DatabaseContext _dbContext = databaseContext;
    private readonly AppSettings _appSettings = appSettings;

    public string IssueAccessToken(User user)
    {
        var jwtInfo = _appSettings.JwtInfo;
        var securityKey = new SymmetricSecurityKey(jwtInfo.Key);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var role = _dbContext.Roles.Single(x => x.Id == user.RoleId);

        var claims = new List<Claim>
        {
            new(AuthConsts.Claims.Role, role.Name),
            new(AuthConsts.Claims.Name, user.Name),
            new(AuthConsts.Claims.UserId, user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtInfo.Issuer,
            audience: jwtInfo.Audience,            
            claims: claims,
            expires: DateTime.Now.AddDays(10),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<Guid> IssueRefreshTokenAsync(User user, Guid? oldTokenId = null)
    {
        var tokenId = Guid.NewGuid();

        using var transaction = _dbContext.Database.BeginTransaction();

        if (oldTokenId != null)
        {
            var oldToken = _dbContext.ChangeTracker.Entries<RefreshToken>().SingleOrDefault(x => x.Entity.TokenId == oldTokenId)?.Entity;
            if (oldToken != null)
                _dbContext.RefreshTokens.Remove(oldToken);
            else
                await _dbContext.RefreshTokens.Where(x => x.TokenId == oldTokenId).ExecuteDeleteAsync();
        }

        var storedToken = new RefreshToken() { UserId = user.Id, TokenId = tokenId, ExpirationDateUtc = DateTime.UtcNow.Add(AuthConsts.RefreshExpire) };
        _dbContext.RefreshTokens.Add(storedToken);
        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();

        return tokenId;
    }

    public JwtSecurityToken DecodeToken(string refreshToken)
    {
        return new JwtSecurityTokenHandler().ReadJwtToken(refreshToken);
    }

    internal async Task<User?> GetUserByToken(Guid tokenId)
    {
        var storedToken = await _dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TokenId == tokenId);

        return storedToken?.User;
    }

    public async Task<bool> DeleteTokenAsync(Guid tokenId)
    {
        var storedToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.TokenId == tokenId);
        if (storedToken == null)
            return false;

        _dbContext.RefreshTokens.Remove(storedToken);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
