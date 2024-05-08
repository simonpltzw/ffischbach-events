using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Group create model.
    /// </summary>
    public class GroupCreateModel
    {
        /// <summary>
        /// Name.
        /// </summary>
        [Required, StringLength(100)]
        public string? Name { get; set; }

        /// <summary>
        /// Category.
        /// </summary>
        [StringLength(50)]
        public string? Category { get; set; }

        /// <summary>
        /// Id of the event this group belongs to.
        /// </summary>
        [Required]
        public string? EventId { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        [Required]
        public ParticipantCreateModel? Contact { get; set; }

        /// <summary>
        /// List of other participants. Do not include the contact here.
        /// </summary>
        [Required, MinLength(0)]
        public List<ParticipantCreateModel>? Participants { get; set; }
    }
}
