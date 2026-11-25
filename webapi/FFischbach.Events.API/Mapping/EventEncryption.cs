using FFischbach.Events.API.Models.InputModels;
using Mapster;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Mapping
{
    /// <summary>
    /// Encryption of personal data with the RSA public key of an event.
    /// </summary>
    /// <remarks>
    /// The UI decrypts this data with the event's private key, so the format must not change:
    /// UTF-8 text, encoded as base64 (simplifies umlaut handling), encrypted with RSA-OAEP-SHA256.
    /// </remarks>
    internal static class EventEncryption
    {
        /// <summary>
        /// Name of the mapping parameter that holds the event's public key in PEM format.
        /// </summary>
        /// <example><code>mapper.From(group).AddParameters(EventEncryption.PublicKeyParameter, dbEvent.PublicKey).AdaptToType&lt;Group&gt;()</code></example>
        public const string PublicKeyParameter = "PublicKey";

        /// <summary>
        /// Encrypts a group name with the public key passed to the current mapping.
        /// </summary>
        public static byte[] EncryptName(string name)
            => Encrypt(name, GetPublicKeyFromMapContext());

        /// <summary>
        /// Encrypts all data of a participant as JSON with the public key passed to the current mapping.
        /// </summary>
        /// <remarks>The JSON contains all properties of the runtime type, e.g. GroupId for a ParticipantCreateModel.</remarks>
        public static byte[] EncryptParticipant(ParticipantInputModel participant)
            => Encrypt(JsonConvert.SerializeObject(participant), GetPublicKeyFromMapContext());

        /// <summary>
        /// Hashes a group name (SHA-256 as lower case hex) to detect duplicate names without decrypting them.
        /// </summary>
        public static string HashName(string name)
            => Convert.ToHexStringLower(SHA256.HashData(ToBase64Bytes(name)));

        private static byte[] Encrypt(string text, string publicKeyPem)
        {
            using RSA rsa = RSA.Create();
            rsa.ImportFromPem(publicKeyPem);

            return rsa.Encrypt(ToBase64Bytes(text), RSAEncryptionPadding.OaepSHA256);
        }

        private static byte[] ToBase64Bytes(string text)
            => Encoding.Default.GetBytes(Convert.ToBase64String(Encoding.UTF8.GetBytes(text)));

        private static string GetPublicKeyFromMapContext()
            => MapContext.Current?.Parameters.GetValueOrDefault(PublicKeyParameter) as string
                ?? throw new InvalidOperationException($"Missing public key for encryption. Pass it with mapper.From(source).AddParameters(\"{PublicKeyParameter}\", publicKey).");
    }
}
