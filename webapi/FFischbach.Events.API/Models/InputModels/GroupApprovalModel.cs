using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Group approval email model.
    /// </summary>
    public class GroupApprovalModel
    {
        /// <summary>
        /// Name.
        /// </summary>
        [Required]
        public string? Name { get; set; }

        /// <summary>
        /// Contact participant.
        /// </summary>
        [Required]
        public ParticipantGroupApprovalModel? Contact { get; set; }

        /// <summary>
        /// List of other participants. Do not include the contact here.
        /// </summary>
        [Required, MinLength(0)]
        public List<ParticipantGroupApprovalModel>? Participants { get; set; }
    }
}
