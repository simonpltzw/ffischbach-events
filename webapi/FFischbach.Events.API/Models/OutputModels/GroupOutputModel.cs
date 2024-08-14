using FFischbach.Events.API.Models.Enums;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

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
        /// Encrypted name.
        /// </summary>
        public required byte[] EncryptedName { get; set; }

        /// <summary>
        /// Category.
        /// </summary>
        public required GroupCategory Category { get; set; }

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
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
