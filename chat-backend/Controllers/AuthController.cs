using chat_backend.Misc;
using chat_backend.Models;
using chat_backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Persistence.Models;
using System.Net;
using System.Security.Claims;

namespace chat_backend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(AuthService passwordService, ILogger<AuthController> logger) : ControllerBase
    {
        private const string AuthScheme = AuthConsts.AuthScheme;
        private readonly AuthService passwordService = passwordService;
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
                var success = await passwordService.Register(model);
                return success ? Ok(new RegisterResponse{ Name = model.Name }) : Conflict("That login already exists");
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
                var success = await passwordService.Login(model);
                if (success)
                {
                    await SetClientRole(model.IsStaySignIn);
                }

                return Ok(success);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest("Error registering");
            }
        }

        [HttpPost("logout")]
        [Authorize(AuthenticationSchemes = AuthConsts.AuthScheme)]
        public async Task<IActionResult> Logout()
        {
            if (!ModelState.IsValid)
                return BadRequest("No enough credentials");
            try
            {
                await HttpContext.SignOutAsync(AuthConsts.AuthScheme);

                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest("Error loggin out");
            }
        }

        private async Task SetClientRole(bool isPersistent)
        {
            var claims = new List<Claim> { new(AuthConsts.RoleClaim, Role.Client) };

            var identity = new ClaimsIdentity(claims, AuthScheme);
            var options = new AuthenticationProperties { IsPersistent = isPersistent };

            await HttpContext.SignInAsync(AuthScheme, new ClaimsPrincipal(identity), options);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete([FromBody] AuthModelRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest("No enough credentials");

            try
            {
                return Ok(await passwordService.Login(model));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest("Error registering");
            }
        }
    }
}
