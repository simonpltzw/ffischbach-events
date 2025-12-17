using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Participant create model.
    /// </summary>
    public class ParticipantCreateModel : ParticipantInputModel
    {
        /// <summary>
        /// Id of the group.
        /// </summary>
        [Required]
        public int? GroupId { get; set; }
    }
}
