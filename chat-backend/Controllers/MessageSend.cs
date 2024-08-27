using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageSend : ControllerBase
    {
        [HttpPost]
        public void SendMessage(string message) { 
        } 
    }
}
