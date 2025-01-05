using Shared.Models.ContactModels;

namespace Shared.Models
{
    public record struct ChatModel
    {
        public int ChatId;
        public string Name;
        public ContactModel[] Participants;
    }
}
