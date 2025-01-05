namespace Shared.Models.ContactModels
{
    public record ContactModel
    {
        public int? UserId { get; set; }
        public int? ChatId { get; set; }
        public string? Name { get; set; } = default!;
        public string? AvatarSrc { get; set; } = default!;
        public bool? IsOnline { get; set; }
    }
}
