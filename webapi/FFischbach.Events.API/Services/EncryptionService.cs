using FFischbach.Events.API.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Services
{
    /// <summary>
    /// Provides rsa asymmetric cryptography functionality.
    /// </summary>
    public class EncryptionService : IEncryptionService
    {
        /// <summary>
        /// RSA algorithm implementation.
        /// </summary>
        private RSA RSA { get; }

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncryptionService()
        {
            RSA = RSA.Create();
        }

        /// <summary>
        /// Returns the current rsa public key.
        /// The public key will change on restart, since this class is injected as singleton.
        /// </summary>
        /// <returns></returns>
        public string GetPublicKey()
        {
            return Convert.ToBase64String(RSA.ExportRSAPublicKey());
        }

        /// <summary>
        /// Decrypts a message.
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public bool TryDecryptString(string message, out string? decryptedValue)
        {
            byte[] buf = new byte[256];
            if (RSA.TryDecrypt(Convert.FromBase64String(message), buf, RSAEncryptionPadding.OaepSHA256, out int bytesWritten))
            {
                // Decryption success.
                decryptedValue = Encoding.Default.GetString(buf, 0, bytesWritten);
                return true;
            }
            else
            {
                // Decryption failed.
                decryptedValue = null;
                return false;
            }
        }
    }
}
