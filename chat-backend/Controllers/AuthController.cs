using Microsoft.AspNetCore.Mvc;
using Persistence;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(DatabaseContext dbContext) : ControllerBase
    {
        private readonly DatabaseContext _dbContext = dbContext;
        [HttpPost("/register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (_dbContext.Users.Any(x => x.Name.ToLower() == model.Name.Trim().ToLower()))
                return BadRequest("Client already exists in system");

            var client = new Persistence.Models.User { Name = model.Name };
            await _dbContext.Users.AddAsync(client);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }
    }
}
