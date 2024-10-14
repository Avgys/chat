using chat_backend.Models;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Persistence.Models;

namespace chat_backend.Services
{
    public class ChatService(DatabaseContext dbContext)
    {
        private readonly DatabaseContext _dbContext = dbContext;
        // private static ContactModel[] mockUsers =
        //{
        //     new() { Id = 1, Name = "Alice", AvatarSrc = "/alice.jpg", LastMessage = "Hey, how are you?", Time = "10:00 AM" },
        //     new() { Id = 2, Name = "Bob", AvatarSrc = "/bob.jpg", LastMessage = "See you later!", Time = "10:15 AM" },
        //     new() { Id = 3, Name = "Charlie", AvatarSrc = "/charlie.jpg", LastMessage = "Let's meet up!", Time = "10:30 AM" }
        // };

        public IEnumerable<ContactModel> GetLastChats(int userId, int count, int skipCount)
        {
            var chats = _dbContext.ChatToUser
                .Where(x => x.UserId == userId)
                .Skip(skipCount)
                .Take(count)
                .Include(x => x.User)
                .Include(x => x.Chat)
                .Select(x => new
                {
                    x.Chat.Id,
                    x.Chat.Name,
                    AvatarSrc = "ImageSrcPlate",
                    LastMessage = "sd",//x.LastMessage.Text,
                    Time = DateTime.Now//x.LastMessage.TimeStampUtc
                })
                .Select(x => new ContactModel
                {
                    UserId = x.Id,
                    Name = x.Name,
                    AvatarSrc = x.AvatarSrc,
                    LastMessage = x.LastMessage,
                    Time = x.Time
                })
                .ToArray();


            return chats ?? [];
        }

        public IEnumerable<ContactModel> GetContactsByName(string name, int count, int skipCount)
        {
            var userContacts = _dbContext.Users
                .Where(x => x.Name.Contains(name) || string.IsNullOrWhiteSpace(name))
                .Skip(skipCount)
                .Take(count)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    AvatarSrc = "ImageSrcPlate",
                    LastMessage = "Placeholder",
                    Time = DateTime.Now
                })
                .Select(x => new ContactModel
                {
                    UserId = x.Id,
                    Name = x.Name,
                    AvatarSrc = x.AvatarSrc,
                    LastMessage = x.LastMessage,
                    Time = x.Time
                });

            return userContacts;
        }
    }
}
