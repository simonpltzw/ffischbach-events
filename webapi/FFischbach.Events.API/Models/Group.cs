namespace FFischbach.Events.API.Models
{
    public class Group
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Category { get; set; }
        public bool? Approved { get; set; }
        public int EventId { get; set; }
        public Event? Event { get; set; }
        public List<Participant>? Participants { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
