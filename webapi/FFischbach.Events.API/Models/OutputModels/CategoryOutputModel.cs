namespace FFischbach.Events.API.Models.OutputModels
{
    public class CategoryOutputModel
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public DateTime? SignUpFrom { get; set; }
        public DateTime? SignUpTo { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public required string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
