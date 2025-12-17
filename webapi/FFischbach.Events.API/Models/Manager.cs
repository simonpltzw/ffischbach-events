namespace FFischbach.Events.API.Models
{
    public class Manager
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public List<EventManager>? EventManagers { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
