using chat_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(AuthService passwordService, ILogger<AuthController> logger) : ControllerBase
    {
        private readonly AuthService passwordService = passwordService;
        private readonly ILogger<AuthController> logger = logger;

        [HttpGet("/register/getSalt")]
        public IActionResult GetSalt()
        {
            var salt = passwordService.GetSalt();
            var basedSalt = Convert.ToBase64String(salt);
            return Ok(basedSalt);
        }

        [HttpPost("/register")]
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

        [HttpPost("/login")]
        public async Task<IActionResult> Login([FromBody] AuthModel model)
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
