namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Event list item output model.
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
        /// Completed.
        /// </summary>
        public bool Completed { get; set; }

        /// <summary>
        /// Amount of groups.
        /// </summary>
        public int TotalGroups { get; set; }

        /// <summary>
        /// Amount of participants.
        /// </summary>
        public int TotalParticipants { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
