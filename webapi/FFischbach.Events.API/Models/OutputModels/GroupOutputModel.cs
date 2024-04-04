namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Group output model.
    /// </summary>
    public class GroupOutputModel
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
        /// Category.
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Approved.
        /// </summary>
        public bool? Approved { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        public required Participant Contact { get; set; }

        /// <summary>
        /// Other participants.
        /// </summary>
        public required List<Participant> Participants { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
