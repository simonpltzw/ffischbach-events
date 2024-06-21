namespace FFischbach.Events.API.Models.OutputModels
{
    public class GroupEventOutputModel
    {
        /// <summary>
        /// Id.
        /// </summary>
        public required string Id { get; set; }

        /// <summary>
        /// Description.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Completed.
        /// </summary>
        public bool Completed { get; set; }

        /// <summary>
        /// RSA public key.
        /// </summary>
        public required string PublicKey { get; set; }

        /// <summary>
        /// AES-Encrypted PKCS#8 RSA private key.
        /// </summary>
        public required string EncryptedPrivateKey { get; set; }

        /// <summary>
        /// Create timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
