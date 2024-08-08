using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Participant update model.
    /// </summary>
    public class ParticipantUpdateModel
    {
        /// <summary>
        /// Id.
        /// </summary>
        [Required]
        public int? Id { get; set; }

        /// <summary>
        /// Encrypted data.
        /// </summary>
        [Required]
        public byte[]? EncryptedData { get; set; }

        /// <summary>
        /// VIP flag.
        /// </summary>
        public bool? VIP { get; set; }
    }
}
