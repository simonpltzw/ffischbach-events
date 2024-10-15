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
        /// Date of the event.
        /// </summary>
        [Required]
        public DateTime? Date { get; set; }

        /// <summary>
        /// Public RSA-OAEP encryption key in spki pem format.
        /// </summary>
        [Required]
        public string? PublicKey { get; set; }

        /// <summary>
        /// AES-Encrypted PKCS#8 RSA private key.
        /// </summary>
        [Required]
        public string? EncryptedPrivateKey { get; set; }
    }
}
