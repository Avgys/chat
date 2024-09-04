using chat_backend;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using Persistence.Models;
using System.Net.Http.Headers;

namespace Backend.Tests
{
    public class SendMessageTest
    {
        private WebApplicationFactory<Program> webAppFactory;

        private User testUser1;
        private User testUser2;

        [OneTimeSetUp]
        public void Setup()
        {
            webAppFactory = new WebApplicationFactory<Program>();

            using var scope = webAppFactory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();

            testUser1 = GetOrAddUser(dbContext, "Test1");
            testUser2 = GetOrAddUser(dbContext, "Test2");
            dbContext.SaveChanges();
        }

        public User GetOrAddUser(DatabaseContext dbContext, string testId)
        {
            var user = dbContext.Users.FirstOrDefault(x => x.Name == testId);
            if (user == null)
            {
                user = new User() { Name = testId, PasswordHash = "NotAPassword" };
                dbContext.Users.Add(user);
            }
            return user;
        }

        [Test]
        public async Task TestMessageSend()
        {
            using var httpClient = webAppFactory.CreateDefaultClient();
            var testText = "TestMessage";

            var content = new StringContent($"{{ \"senderId\": {testUser1.Id}, \"cliendId\": {testUser2.Id},\"messageText\": \"{testText}\" }}", new MediaTypeHeaderValue("application/json"));
            var url = "api/MessageSend";
            var result = await httpClient.PostAsync(url, content);
            Assert.That(result.IsSuccessStatusCode);

            using var scope = webAppFactory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
            var chat = dbContext.Chats
               .Where(x => !x.IsGroup)
               .Include(x => x.Users)
               .Where(y => y.Users.Any(x => x.UserId == testUser1.Id) && y.Users.Any(x => x.UserId == testUser2.Id))
               .Include(x => x.Messages)
               .Single();
            
            Assert.That(chat.Messages.Any(x => x.Text == testText));
        }

        [OneTimeTearDown]
        public void Dispose()
        {
            webAppFactory.Dispose();
        }
    }
}