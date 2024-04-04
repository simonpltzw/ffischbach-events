namespace FFischbach.Events.API.Models
{
    public class Event
    {
        public required string Id { get; set; }
        public required string Description { get; set; }
        public required string PublicKey { get; set; }
        public required string PrivateKeyHash { get; set; }
        public required List<Group> Groups { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
