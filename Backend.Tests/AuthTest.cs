using chat_backend;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System.Net.Http.Json;

namespace Backend.Tests
{
    public class AuthTest
    {
        private WebApplicationFactory<Program> webAppFactory;

        private const string _authUrl= "api/auth";
        private const string _saltUrl = _authUrl + "/salt";
        private const string _loginUrl = _authUrl + "/login";
        private const string _registerUrl = _authUrl + "/register";

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

            var salt = await client.GetAsync(_saltUrl);
            Assert.That(salt.IsSuccessStatusCode);

            var saltText = salt.Content.ReadAsStringAsync().Result;

            var registerModel = new AuthModelRequest
            {
                ClientPasswordHash = _credentials.Password + saltText,
                ClientSalt = saltText,
                Name = _credentials.Login
            };

            var response = await client.PostAsync(_registerUrl, JsonContent.Create(registerModel));
            Assert.That(response.IsSuccessStatusCode);
        }

        [Test]
        public async Task LoginTest()
        {
            using var client = webAppFactory.CreateDefaultClient();

            var salt = await client.GetAsync(_saltUrl);
            Assert.That(salt.IsSuccessStatusCode);

            var saltText = salt.Content.ReadAsStringAsync().Result;

            var credentials = new AuthModelRequest
            {
                ClientPasswordHash = _credentials.Password + saltText,
                ClientSalt = saltText,
                Name = _credentials.Login
            };

            var response = await client.PostAsync(_loginUrl, JsonContent.Create(credentials));
            Assert.That(response.IsSuccessStatusCode);
        }

        [OneTimeTearDown]
        public void TearDown()
        {
            webAppFactory.Dispose();
        }
    }
}
