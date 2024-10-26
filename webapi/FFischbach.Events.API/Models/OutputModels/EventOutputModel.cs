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
        /// Date of the event.
        /// </summary>
        public required DateTime Date { get; set; }

        /// <summary>
        /// Completed.
        /// </summary>
        public required bool Completed { get; set; }

        /// <summary>
        /// Amount of groups.
        /// </summary>
        public required int TotalGroups { get; set; }

        /// <summary>
        /// Amount of participants.
        /// </summary>
        public required int TotalParticipants { get; set; }

        /// <summary>
        /// Last updated identifier.
        /// </summary>
        public string? UpdatedBy { get; set; }

        /// <summary>
        /// Last updated timestamp.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Create identifier.
        /// </summary>
        public required string CreatedBy { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public required DateTime CreatedAt { get; set; }
    }
}
