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
        public required string Id { get; set; }

        /// <summary>
        /// Description.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// List of groups.
        /// </summary>
        public required List<GroupOutputModel> Groups { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
