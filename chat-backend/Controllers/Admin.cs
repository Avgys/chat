using Microsoft.AspNetCore.Mvc;
using Persistence;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Admin(DatabaseContext context) : ControllerBase
    {
        private DatabaseContext dbContext = context;

        [HttpGet("Users")]
        public IEnumerable<string> GetUsers()
        {
            return dbContext.Users.Select(x => x.Name);
        }

        [HttpGet("Dms")]
        public IEnumerable<string> GetDirectChats()
        {
            return dbContext.Chats.Where(x => !x.IsGroup).Select(x => x.Name);
        }
    }
}
