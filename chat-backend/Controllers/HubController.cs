using chat_backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Persistence.Models;

namespace chat_backend.Controllers
{
    [ApiController]
    [Route("hub/test")]
    public class HubController : Controller
    {
        private IHubContext<ChatHub> _hub;

        public HubController(IHubContext<ChatHub> hub)
        {
            _hub = hub;
        }

        [HttpGet("hub/test")]
        public async Task<IActionResult> GetTest()
        {
            await _hub.Clients.All.SendAsync("message", 1, "Hello");
            return Ok();
        }
    }
}
