namespace chat_backend
{
    public class AuthModel
    {
        public string Name { get; set; } = string.Empty;
        public string? ClientSalt { get; set; }
        public string ClientPasswordHash { get; set; } = string.Empty;
        public bool IsStaySignIn { get; set; } = false;
    }
}
