using chat_backend;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Headers;

namespace Backend.Tests
{
    public class SendMessageTest
    {
        private WebApplicationFactory<Program> webAppFactory;
        private HttpClient httpClient;

        [SetUp]
        public void Setup()
        {
            webAppFactory = new WebApplicationFactory<Program>();
            httpClient = webAppFactory.CreateDefaultClient();
        }

        [Test]
        public async Task TestMessageSend()
        {
            var content = new StringContent("{\r\n  \"senderId\": 1,\r\n  \"cliendId\": 2,\r\n  \"messageText\": \"string\"\r\n}", new MediaTypeHeaderValue("application/json"));
            var result = await httpClient.PostAsync("api/MessageSend", content);
            Assert.That(result.IsSuccessStatusCode);
        }
    }
}