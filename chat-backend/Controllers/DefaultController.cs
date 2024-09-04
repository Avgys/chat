using Microsoft.AspNetCore.Mvc;

namespace chat_backend.Controllers
{
    [Route("/")]
    [ApiController]
    public class DefaultController : ControllerBase
    {
        private const string SESSION_VALUE = "SESSION_VALUE";

        [HttpGet]
        public string Get()
        {
           return HttpContext.Session.GetString(SESSION_VALUE) ?? string.Empty;
        }

        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }
    }
}
