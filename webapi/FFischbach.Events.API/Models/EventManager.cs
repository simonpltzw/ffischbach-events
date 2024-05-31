namespace FFischbach.Events.API.Models
{
    public class EventManager
    {
        public int Id { get; set; }
        public required int ManagerId { get; set; }
        public Manager? Manager { get; set; }
        public required string EventId { get; set; }
        public Event? Event { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
