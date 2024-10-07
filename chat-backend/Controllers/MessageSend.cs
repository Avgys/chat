using chat_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Models;

namespace chat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageSend(DatabaseContext dbContext, ILogger<MessageSend> logger) : ControllerBase
    {
        private readonly DatabaseContext dbContext = dbContext;
        private readonly ILogger<MessageSend> logger = logger;
        private const string CLIENT_ID = "CLIENT_ID";

        [Authorize(Roles = Role.Client)]
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] MessageModel message)
        {
            var senderId = message.SenderId;
            var receiverId = message.CliendId;

            if (!await dbContext.Users.AnyAsync(x => x.Id == senderId) || !await dbContext.Users.AnyAsync(x => x.Id == receiverId))
                return NotFound("No such client");

            //var chat = GetSharedChat(HttpContext.Session.GetInt32(CLIENT_ID)!.Value, message.CliendId);
            var chat = await GetSharedDirectChat(senderId, receiverId);

            await dbContext.Messages.AddAsync(new Message
            {
                Chat = chat,
                SenderId = senderId,
                Text = message.MessageText,
                TimeStampUtc = DateTime.UtcNow,
            });

            await dbContext.SaveChangesAsync();

            logger.LogInformation($"Sender {senderId} send message to receiver {receiverId}");

            return Ok();
        }

        private async Task<Chat> GetSharedDirectChat(int senderId, int receiverId)
        {
            var chat = dbContext.Chats
                .Where(x => !x.IsGroup)
                .Include(x => x.Users)
                .Where(y => y.Users.Any(x => x.UserId == senderId) && y.Users.Any(x => x.UserId == receiverId)).SingleOrDefault();

            if (chat == null)
            {
                chat = new Chat { Name = senderId.ToString(), IsGroup = false };
                await dbContext.AddAsync(chat);

                await dbContext.ChatToUser.AddAsync(new ChatToUser
                {
                    Chat = chat,
                    UserId = senderId
                });

                await dbContext.ChatToUser.AddAsync(new ChatToUser
                {
                    Chat = chat,
                    UserId = receiverId
                });
            }

            return chat;
        }
    }
}
