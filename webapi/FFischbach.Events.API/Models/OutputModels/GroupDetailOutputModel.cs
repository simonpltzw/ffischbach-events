namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Group details output model.
    /// </summary>
    public class GroupDetailOutputModel
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
        /// Amount of participants.
        /// </summary>
        public int TotalParticipants { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        public required ParticipantOutputModel Contact { get; set; }

        /// <summary>
        /// Other participants.
        /// </summary>
        public required List<ParticipantOutputModel> Participants { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
