using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    public class EventUpdateModel
    {
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
