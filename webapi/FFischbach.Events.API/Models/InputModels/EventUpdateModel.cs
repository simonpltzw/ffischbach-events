using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    public class EventUpdateModel
    {
        /// <summary>
        /// Description of the event.
        /// </summary>
        [StringLength(1000)]
        public string? Description { get; set; }

        /// <summary>
        /// Date of the event.
        /// </summary>
        [Required]
        public DateTime? Date { get; set; }

        /// <summary>
        /// Completed.
        /// </summary>
        [Required]
        public bool? Completed { get; set; }
    }
}
