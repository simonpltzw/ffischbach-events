using FFischbach.Events.API.Models.InputModels;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Tests.Infrastructure
{
    /// <summary>
    /// Builders for valid request bodies and helpers for the event encryption.
    /// </summary>
    public static class TestData
    {
        public const string Manager = "manager@example.com";
        public const string OtherUser = "other@example.com";

        // The API encrypts group names and participant data with the event's RSA public key,
        // so tests need a real key pair. Generated once per test run, it is slow.
        private static readonly Lazy<(string PublicPem, string PrivatePem)> KeyPair = new(() =>
        {
            using RSA rsa = RSA.Create(4096);
            return (rsa.ExportSubjectPublicKeyInfoPem(), rsa.ExportPkcs8PrivateKeyPem());
        });

        public static string PublicKeyPem => KeyPair.Value.PublicPem;

        public static EventCreateModel NewEvent(string id, DateTime? date = null) => new()
        {
            Id = id,
            Description = "Testevent",
            Date = date ?? DateTime.UtcNow.AddMonths(2),
            PublicKey = PublicKeyPem,
            EncryptedPrivateKey = "encrypted-private-key",
            PrivateKeyEncryptionSalt = "salt",
            PrivateKeyEncryptionIV = "iv"
        };

        public static EventUpdateModel UpdateEvent(string description = "Geänderte Beschreibung", bool completed = false) => new()
        {
            Description = description,
            Date = DateTime.UtcNow.AddMonths(3),
            Completed = completed,
            RegistrationEmailContent = "<p>Hallo [[ContactFirstName]]</p>",
            ApprovalEmailContent = "<p>Genehmigt: [[GroupName]]</p>"
        };

        public static GroupCreateModel NewGroup(string eventId, int categoryId, string name = "Löschzug Süd") => new()
        {
            Name = name,
            EventId = eventId,
            CategoryId = categoryId,
            Contact = new ParticipantGroupCreateModel
            {
                FirstName = "Max",
                LastName = "Mustermann",
                Email = "max@example.com",
                BirthDate = new DateOnly(2000, 1, 1)
            },
            Participants =
            [
                new ParticipantGroupCreateModel { FirstName = "Erika", LastName = "Musterfrau", BirthDate = new DateOnly(1999, 5, 4) },
                new ParticipantGroupCreateModel { FirstName = "Jürgen", LastName = "Groß", BirthDate = new DateOnly(1985, 12, 24) }
            ]
        };

        public static GroupApprovalModel ApproveGroup(string name = "Löschzug Süd") => new()
        {
            Name = name,
            Contact = new ParticipantGroupApprovalModel
            {
                FirstName = "Max",
                LastName = "Mustermann",
                Email = "max@example.com",
                BirthDate = new DateOnly(2000, 1, 1)
            },
            Participants = []
        };

        /// <summary>
        /// Decrypts data the API encrypted with the test public key (RSA-OAEP-SHA256 over a base64 string).
        /// </summary>
        public static string Decrypt(byte[] encrypted)
        {
            using RSA rsa = RSA.Create();
            rsa.ImportFromPem(KeyPair.Value.PrivatePem);

            string base64 = Encoding.Default.GetString(rsa.Decrypt(encrypted, RSAEncryptionPadding.OaepSHA256));
            return Encoding.UTF8.GetString(Convert.FromBase64String(base64));
        }
    }
}
