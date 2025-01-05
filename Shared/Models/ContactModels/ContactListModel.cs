using Shared.Models.ContactModels;

namespace Shared.Models
{
    public record ContactListModel : ContactModel
    {
        public string? LastMessage { get; set; }
        public DateTime? LastMessageUTC { get; set; }
        public bool? IsStranger { get; set; }
    }
}
