using AuthService.Misc;
using chat_backend.Models;
using chat_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace chat_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class Chats(ChatService chatService) : ControllerBase
    {
        private readonly ChatService _chatService = chatService;

        [HttpGet("contacts/my")]
        public ActionResult<ContactModel[]> GetOpenChatsAsync([FromQuery] int count = 20, [FromQuery] int skipCount = 0)
        {
            var userId = int.Parse(HttpContext.User.Claims.FirstOrDefault(x => x.Type == AuthConsts.Claims.UserId)!.Value);
            return Ok(_chatService.GetLastChats(userId, count, skipCount));
        }

        [HttpGet("contacts")]
        public ActionResult<ContactModel[]> GetContactsByNameAsync([FromQuery] string nameFilter = "", [FromQuery] int count = 20, [FromQuery] int skipCount = 0)
        {
            return Ok(_chatService.GetContactsByName(nameFilter, count, skipCount));
        }
    }
}
