namespace FFischbach.Events.API.Services.Interfaces
{
    /// <summary>
    /// Provides rsa asymmetric cryptography functionality.
    /// </summary>
    public interface IEncryptionService
    {
        /// <summary>
        /// Returns the current rsa public key.
        /// The public key will change on restart, since this class is injected as singleton.
        /// </summary>
        /// <returns></returns>
        string GetPublicKey();

        /// <summary>
        /// Decrypts a message.
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        bool TryDecryptString(string message, out string? decryptedValue);
    }
}
