namespace FFischbach.Events.API.Models
{
    public class EventManager
    {
        public int Id { get; set; }
        public Guid EntraObjectId { get; set; }
        public required string EventId { get; set; }
        public Event? Event { get; set; }
    }
}
