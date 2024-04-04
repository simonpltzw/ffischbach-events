namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Event output model.
    /// </summary>
    public class EventOutputModel
    {
        /// <summary>
        /// Id.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name.
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// List of groups.
        /// </summary>
        public List<GroupOutputModel>? Groups { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
