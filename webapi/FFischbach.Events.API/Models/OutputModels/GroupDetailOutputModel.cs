﻿#nullable enable

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
        /// Hashed name.
        /// </summary>
        public required string HashedName { get; set; }

        /// <summary>
        /// Encrypted name.
        /// </summary>
        public required byte[] EncryptedName { get; set; }

        /// <summary>
        /// Category.
        /// </summary>
        public required CategoryOutputModel Category { get; set; }

        /// <summary>
        /// Approved.
        /// </summary>
        public bool? Approved { get; set; }

        /// <summary>
        /// Amount of participants.
        /// </summary>
        public int TotalParticipants { get; set; }

        /// <summary>
        /// Event.
        /// </summary>
        public required GroupEventOutputModel Event { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        public required ParticipantOutputModel Contact { get; set; }

        /// <summary>
        /// Other participants.
        /// </summary>
        public required List<ParticipantOutputModel> Participants { get; set; }

        /// <summary>
        /// Last updated identifier.
        /// </summary>
        public string? UpdatedBy { get; set; }

        /// <summary>
        /// Last updated timestamp.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
