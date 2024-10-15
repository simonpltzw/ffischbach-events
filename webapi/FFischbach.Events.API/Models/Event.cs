namespace FFischbach.Events.API.Models
{
    public class Event
    {
        public required string Id { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public bool Completed { get; set; }
        public required string PublicKey { get; set; }
        public required string EncryptedPrivateKey { get; set; }
        public List<Group>? Groups { get; set; }
        public List<EventManager>? EventManagers { get; set; }
        public List<Category>? Categories { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
