namespace FFischbach.Events.API.Models
{
    public class Event
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string PublicKey { get; set; }
        public required string PrivateKeyHash { get; set; }
        public List<Group>? Groups { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
