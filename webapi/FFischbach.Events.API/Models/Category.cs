namespace FFischbach.Events.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime? SignUpFrom { get; set; }
        public DateTime? SignUpTo { get; set; }
        public required string EventId { get; set; }
        public Event? Event { get; set; }
        public List<Group>? Groups { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
