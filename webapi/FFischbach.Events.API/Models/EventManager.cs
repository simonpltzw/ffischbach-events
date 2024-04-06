namespace FFischbach.Events.API.Models
{
    public class EventManager
    {
        public int Id { get; set; }
        public required Guid EntraObjectId { get; set; }
        public required string EventId { get; set; }
        public Event? Event { get; set; }
    }
}
