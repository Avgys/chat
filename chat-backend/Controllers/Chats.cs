﻿using Auth.Shared.Misc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repositories.Services;
using Shared.Models;
using Shared.Models.ContactModels;

namespace chat_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class Chats(ChatService chatService) : ControllerBase
    {
        private readonly ChatService _chatService = chatService;
        private int requestUserId => int.Parse(HttpContext.User.Claims.Single(x => x.Type == AuthConsts.Claims.UserId)!.Value);

        [HttpGet("contacts")]
        public async Task<ActionResult<ContactModel[]>> GetContactsByNameAsync([FromQuery] string name = "", [FromQuery] int count = 20, [FromQuery] int skipCount = 0)
        {
            IEnumerable<ContactModel> usersContacts = await _chatService.GetLastChats(requestUserId, name, count, skipCount)!;

            if (!string.IsNullOrWhiteSpace(name) && usersContacts.Count() < count)
            {
                var excludeUsers = usersContacts.Where(x => x.UserId != null).Select(x => x.UserId!.Value).ToArray();
                var excludeChats = usersContacts.Where(x => x.ChatId != null).Select(x => x.ChatId!.Value).ToArray();
                var strangers = await _chatService.GetContactsByName(name, count, skipCount, excludeUsers, excludeChats);
                usersContacts = usersContacts.Union(strangers);
            }

            return Ok(usersContacts);
        }

        [HttpGet]
        public async Task<ActionResult<ContactModel>> ContactByIdAsync([FromQuery] int? chatId = null, [FromQuery] int? userId = null)
        {
            ContactModel? contact = null;
            if (chatId != null)
                contact = await _chatService.GetChatContactByIdAsync(requestUserId, chatId.Value)!;
            else if (userId != null)
                contact = await _chatService.GetUserContactByIdAsync(userId)!;

            return contact != null ? Ok(contact) : NotFound(chatId);
        }

        [HttpGet("messages")]
        public async Task<ActionResult<MessageModel[]>> GetMessages([FromQuery] int chatId, [FromQuery] int count = 20, [FromQuery] int skipCount = 0)
        {
            if (!await _chatService.IsParticipantAsync(requestUserId, chatId))
                return Unauthorized("Not participant of chat");

            var userId = int.Parse(HttpContext.User.Claims.Single(x => x.Type == AuthConsts.Claims.UserId)!.Value);
            var messages = await _chatService.GetMessages(userId, chatId, count, skipCount);

            return Ok(messages);
        }

        [HttpGet("participants")]
        public async Task<ActionResult<MessageModel[]>> GetParticipants([FromQuery] int chatId)
        {
            if (!await _chatService.IsParticipantAsync(requestUserId, chatId))
                return Unauthorized("Not participant of chat");
            
            var participants = await _chatService.GetParticipants(chatId);

            return participants != null ? Ok(participants) : NotFound();
        }
    }
}