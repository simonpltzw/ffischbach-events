namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Event list item output model.
    /// </summary>

    public class EventListItemOutputModel
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
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
