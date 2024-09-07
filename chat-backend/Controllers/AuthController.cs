using chat_backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(AuthService passwordService, ILogger<AuthController> logger) : ControllerBase
    {
        public const string AuthScheme = "AuthCookie";
        private readonly AuthService passwordService = passwordService;
        private readonly ILogger<AuthController> logger = logger;

        [HttpGet("salt")]
        public IActionResult GetSalt()
        {
            var salt = passwordService.GetSalt();
            return Ok(salt);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)
                || string.IsNullOrWhiteSpace(model.ClientSalt)
                || string.IsNullOrWhiteSpace(model.ClientPasswordHash))
                return BadRequest("No enough credentials");

            try
            {
                return Ok(await passwordService.Register(model));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest("Error registering");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)
                || string.IsNullOrWhiteSpace(model.ClientPasswordHash))
                return BadRequest("No enough credentials");

            try
            {
                var success = await passwordService.Login(model);
                if (success)
                {
                    await SetUserRole(model.IsStaySignIn);
                }

                return Ok(success);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                return BadRequest("Error registering");
            }
        }

        private async Task SetUserRole(bool isPersistent)
        {
            var claims = new List<Claim> { new(ClaimTypes.Role, "User") };

            var identity = new ClaimsIdentity(claims, AuthScheme);
            var options = new AuthenticationProperties { IsPersistent = isPersistent };

            await HttpContext.SignInAsync(AuthScheme, new ClaimsPrincipal(identity), options);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete([FromBody] AuthModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Name)
                || string.IsNullOrWhiteSpace(model.ClientPasswordHash))
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
