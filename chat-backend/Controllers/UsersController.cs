using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Models;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = Auth.UserPolicy)]
    public class UsersController(DatabaseContext dbContext, ILogger<MessageSend> logger) : ControllerBase
    {
        private readonly DatabaseContext dbContext = dbContext;
        private readonly ILogger<MessageSend> logger = logger;

        [HttpGet("/users")]
        public async Task<IActionResult> GetUsers([FromQuery(Name ="Name")] string? name)
        {
            ICollection<User> users;

            try
            {
                users = await (string.IsNullOrEmpty(name) ? dbContext.Users.ToArrayAsync() : dbContext.Users.Where(x => x.Name.Contains(name)).ToArrayAsync());

                return Ok(User);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
#if DEBUG
                return BadRequest(ex.Message);
#else
                return BadRequest("Get users error")
#endif
            }
        }
    }
}
