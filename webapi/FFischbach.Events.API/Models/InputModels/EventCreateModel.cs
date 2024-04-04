using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Models.InputModels
{
    /// <summary>
    /// Event create model.
    /// </summary>
    public class EventCreateModel
    {
        /// <summary>
        /// Name of the event.
        /// </summary>
        [Required, StringLength(50)]
        public string? Name { get; set; }

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
