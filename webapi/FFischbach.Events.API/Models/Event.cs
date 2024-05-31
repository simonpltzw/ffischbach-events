namespace FFischbach.Events.API.Models
{
    public class Event
    {
        public required string Id { get; set; }
        public required string Description { get; set; }
        public bool Completed { get; set; }
        public required string PublicKey { get; set; }
        public required string EncryptedPrivateKey { get; set; }
        public List<Group>? Groups { get; set; }
        public List<EventManager>? EventManagers { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
