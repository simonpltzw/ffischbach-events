using FFischbach.Events.API.Models.Enums;

namespace FFischbach.Events.API.Models
{
    public class Group
    {
        public int Id { get; set; }
        public required string HashedName { get; set; }
        public required byte[] EncryptedName { get; set; }
        public required GroupCategory Category { get; set; }
        public bool? Approved { get; set; }
        public required string EventId { get; set; }
        public Event? Event { get; set; }
        public List<Participant>? Participants { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
