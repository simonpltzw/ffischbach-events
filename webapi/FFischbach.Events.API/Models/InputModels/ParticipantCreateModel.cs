using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Participant create model.
    /// </summary>
    public class ParticipantCreateModel
    {
        /// <summary>
        /// Email adress, only needed on contact.
        /// </summary>
        [EmailAddress]
        public string? Email { get; set; }

        /// <summary>
        /// First name.
        /// </summary>
        [Required]
        public string? FirstName { get; set; }

        /// <summary>
        /// Last name.
        /// </summary>
        [Required]
        public string? LastName { get; set; }

        /// <summary>
        /// Birth date.
        /// </summary>
        /// <example>2000-12-31</example>
        [Required]
        public DateOnly? BirthDate { get; set; }
    }
}
