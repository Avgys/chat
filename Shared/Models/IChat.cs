namespace Shared.Models
{
    public interface IChat
    {
        public int Id { get; set; }
        public bool IsGroup { get; set; }
    }
}