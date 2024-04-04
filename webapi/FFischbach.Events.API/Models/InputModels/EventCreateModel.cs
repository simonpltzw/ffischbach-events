using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Event create model.
    /// </summary>
    public class EventCreateModel
    {
        /// <summary>
        /// Id. Has to follow a certain pattern, for example 'RAUP2026'
        /// </summary>
        [Required, MaxLength(20)]
        public string? Id { get; set; }

        /// <summary>
        /// Description of the event.
        /// </summary>
        [StringLength(1000)]
        public string? Description { get; set; }

        /// <summary>
        /// Public RSA-OAEP encryption key exported as JWK.
        /// </summary>
        [Required]
        public string? PublicKey { get; set; }

        /// <summary>
        /// SHA-256 hash of the private RSA-OAEP encryption key exported as PKCS#8.
        /// </summary>
        [Required, StringLength(64, MinimumLength = 64)]
        public string? PrivateKeyHash { get; set; }
    }
}
