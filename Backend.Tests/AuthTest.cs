using chat_backend;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Persistence;

namespace Backend.Tests
{
    public class AuthTest
    {
        private WebApplicationFactory<Program> webAppFactory;
        private HttpClient httpClient;

        private readonly (string Login, string Password) _credentials = ("TestUser", "TestPassword");

        [OneTimeSetUp]
        public void Setup()
        {
            webAppFactory = new WebApplicationFactory<Program>();

            using var scope = webAppFactory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        }

        [Test]
        public async Task RegisterTest()
        {
            using var client = webAppFactory.CreateDefaultClient();
            var 
            var url = "api/register/getSalt";
            await client.GetAsync(url);
        }

        [Test]
        public void LoginTest()
        {

        }

        [OneTimeTearDown]
        public void TearDown()
        {
            webAppFactory.Dispose();
        }
    }
}
