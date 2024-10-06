using AuthService.Misc;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Models;

namespace AuthService.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController(
    AuthenticateService passwordService,
    TokenService tokenService,
    ILogger<AuthController> logger) : ControllerBase
{
    private const string AuthScheme = AuthConsts.AuthScheme;
    private readonly AuthenticateService passwordService = passwordService;
    private readonly TokenService tokenService = tokenService;
    private readonly ILogger<AuthController> logger = logger;

    [HttpGet("salt")]
    public IActionResult GetSalt([FromQuery(Name = "Name")] string? name)
    {
        var salt = string.IsNullOrEmpty(name) ? passwordService.GetSalt() : passwordService.GetSalt(name);
        return Ok(new { salt });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthModelRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            var success = await passwordService.RegisterAsync(model);
            return success ? Ok(new RegisterResponse { Name = model.Name }) : Conflict("That login already exists");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            return BadRequest("Error registering");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthModelRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            var user = await passwordService.LoginAsync(model);

            if (user == null)
                return Unauthorized("Wrong credentials");

            var newToken = await tokenService.IssueRefreshTokenAsync(user);
            IncludeRefreshTokenAsync(newToken);
            var token = tokenService.IssueAccessToken(user);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            return BadRequest("Error login");
        }
    }

    [HttpGet("private/refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            if (!TryGetRefreshToken(out var guidToken))
                return Unauthorized();

            var user = await tokenService.GetUserByToken(guidToken);

            if (user == null)
                return Unauthorized("User not found");

            var newToken = await tokenService.IssueRefreshTokenAsync(user, guidToken);
            IncludeRefreshTokenAsync(newToken);

            var token = tokenService.IssueAccessToken(user);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            return BadRequest("Error login");
        }
    }

    [Authorize]
    [HttpPost("private/logout")]
    public async Task<IActionResult> Logout()
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            if (!TryGetRefreshToken(out var guid))
                return Unauthorized();

            var success = await tokenService.DeleteTokenAsync(guid);
            Response.Cookies.Delete(AuthConsts.RefreshToken);
            
            return success ? Ok(success) : Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            return BadRequest("Error loggin out");
        }
    }

    //[Authorize(Roles = Role.Client)]
    //[HttpGet("isAuth", Order = 0)]
    //public IActionResult IsAuthorized()
    //{
    //    return Ok(true);
    //}

    private bool TryGetRefreshToken(out Guid guidToken)
    {
        guidToken = Guid.Empty;
        return Request.Cookies.TryGetValue(AuthConsts.RefreshToken, out var refreshToken) && Guid.TryParse(refreshToken, out guidToken);
    }

    private void IncludeRefreshTokenAsync(Guid tokenId)
    {
        Response.Cookies.Append(AuthConsts.RefreshToken, tokenId.ToString(), new CookieOptions()
        {
            MaxAge = TimeSpan.FromDays(1),
            HttpOnly = true,
            Secure = true,
            Path = "/api/auth/private"
        });
    }

    [Authorize]
    [HttpDelete("delete")]
    public async Task<IActionResult> Delete([FromBody] AuthModelRequest model)
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            return Ok(await passwordService.LoginAsync(model));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            return BadRequest("Error registering");
        }
    }
}
