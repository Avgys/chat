﻿using AuthService.Misc;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Models;

namespace AuthService.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController(
    AuthenticateService _authService,
    TokenService tokenService,
    ILogger<AuthController> logger) : ControllerBase
{
    private const string AuthScheme = AuthConsts.AuthScheme;
    private readonly AuthenticateService passwordService = _authService;
    private readonly TokenService _tokenService = tokenService;
    private readonly ILogger<AuthController> _logger = logger;

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
            _logger.LogError(ex, ex.Message);
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

            var newToken = await _tokenService.IssueRefreshTokenAsync(user);
            IncludeRefreshTokenAsync(newToken);
            var token = _tokenService.IssueAccessToken(user);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return BadRequest("Error login");
        }
    }

    [HttpGet("refreshToken/refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            if (!TryGetRefreshToken(out var guidToken))
                return Unauthorized();

            var user = await _tokenService.GetUserByToken(guidToken);

            if (user == null)
                return Unauthorized("User not found");

            var newToken = await _tokenService.IssueRefreshTokenAsync(user, guidToken);
            IncludeRefreshTokenAsync(newToken);

            var token = _tokenService.IssueAccessToken(user);

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return BadRequest("Error login");
        }
    }

    [Authorize]
    [HttpPost("refreshToken/logout")]
    public async Task<IActionResult> Logout()
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            if (!TryGetRefreshToken(out var guid))
                return Unauthorized();

            var success = await _tokenService.DeleteTokenAsync(guid);
            Response.Cookies.Delete(AuthConsts.RefreshToken);

            return success ? Ok(success) : Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return BadRequest("Error loggin out");
        }
    }

    private bool TryGetRefreshToken(out Guid guidToken)
    {
        guidToken = Guid.Empty;
        return Request.Cookies.TryGetValue(AuthConsts.RefreshToken, out var refreshToken) && Guid.TryParse(refreshToken, out guidToken);
    }

    private void IncludeRefreshTokenAsync(Guid tokenId)
    {
        Response.Cookies.Append(AuthConsts.RefreshToken, tokenId.ToString(), new CookieOptions()
        {
            MaxAge = AuthConsts.RefreshExpire,
            Path = "/api/auth/private",
            Secure = true,
            HttpOnly = true,
            SameSite = SameSiteMode.None
        });
    }

    [Authorize]
    [HttpDelete("delete")]
    public async Task<IActionResult> Delete()
    {
        if (!ModelState.IsValid)
            return BadRequest("No enough credentials");

        try
        {
            var userIdStr = User.Claims.FirstOrDefault(x => x.Type == AuthConsts.Claims.UserId)?.Value;

            if (int.TryParse(userIdStr, out var userId))
                return await _authService.DeleteUser(userId) ? Ok() : NotFound();
            else
                return Unauthorized("Wrong user bearer");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            return BadRequest("Error registering");
        }
    }
}
