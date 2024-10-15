using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Category create model.
    /// </summary>
    public class CategoryCreateModel
    {
        /// <summary>
        /// Display name of the category.
        /// </summary>
        [Required, StringLength(255)]
        public string? Name { get; set; }
        
        /// <summary>
        /// Date from where sign up is possible. Leave empty if you don't want to restrict this.
        /// </summary>
        public DateTime? SignUpFrom { get; set; }

        /// <summary>
        /// Date until sign up is possible. Leave empty if you don't want to restrict this.
        /// </summary>
        public DateTime? SignUpTo { get; set; }

        /// <summary>
        /// Id of the event the category will be assigned to.
        /// </summary>
        [Required, StringLength(20)]
        public string? EventId { get; set; }
    }
}
