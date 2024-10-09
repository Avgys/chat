using chat_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;

namespace chat_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class Chats : ControllerBase
    {
        private static ContactModel[] mockUsers =
        {
            new() { Id = 1, Name = "Alice", AvatarSrc = "/alice.jpg", LastMessage = "Hey, how are you?", Time = "10:00 AM" },
            new() { Id = 2, Name = "Bob", AvatarSrc = "/bob.jpg", LastMessage = "See you later!", Time = "10:15 AM" },
            new() { Id = 3, Name = "Charlie", AvatarSrc = "/charlie.jpg", LastMessage = "Let's meet up!", Time = "10:30 AM" }
        };

        [HttpGet]
        public ActionResult<ContactModel[]> GetOpenChatsAsync([FromQuery] int count = 0, [FromQuery] int skip = 0)
        {
            return Ok(mockUsers);
        }
    }
}
