using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Group update model.
    /// </summary>
    public class GroupUpdateModel
    {
        /// <summary>
        /// SHA256 hash of the name. This has to be re-calculated in the front-end if updated.
        /// </summary>
        [Required, StringLength(64)]
        public string? HashedName { get; set; }

        /// <summary>
        /// RSA encrypted name using the events private key. This has to be re-encrypted in the front-end if updated.
        /// </summary>
        [Required]
        public byte[]? EncryptedName { get; set; }

        /// <summary>
        /// Category.
        /// </summary>
        [Required]
        public int? CategoryId { get; set; }

        /// <summary>
        /// Approved.
        /// </summary>
        public bool? Approved { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        [Required]
        public ParticipantUpdateModel? Contact { get; set; }

        /// <summary>
        /// List of other participants. Do not include the contact here.
        /// </summary>
        [Required, MinLength(0)]
        public List<ParticipantUpdateModel>? Participants { get; set; }
    }
}
