namespace FFischbach.Events.API.Models.OutputModels
{
    /// <summary>
    /// Participant output model.
    /// </summary>
    public class ParticipantOutputModel
    {
        /// <summary>
        /// Id.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Encrypted data.
        /// </summary>
        public required string EncryptedData { get; set; }

        /// <summary>
        /// VIP flag.
        /// </summary>
        public bool? VIP { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
