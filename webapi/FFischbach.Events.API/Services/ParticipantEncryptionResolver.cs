using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Services
{
    public class ParticipantEncryptionResolver : IValueResolver<ParticipantCreateModel, Participant, string>
    {
        public string Resolve(ParticipantCreateModel source, Participant destination, string destMember, ResolutionContext context)
        {
            // Get public key from context.
            string publicKey = context.Items["PublicKey"] as string ?? throw new Exception("Missing public key on participant encryption.");

            // Import public key in pem format.
            RSA rsa = RSA.Create();
            rsa.ImportFromPem(publicKey);

            // Parse create model to json.
            string json = JsonConvert.SerializeObject(source);

            // Parse json to byte array.
            byte[] data = Encoding.Default.GetBytes(json);

            // Encrypt data.
            byte[] encryptedData = rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256);

            // Parse encrypted data to string.
            string encryptedString = Encoding.Default.GetString(encryptedData);

            return encryptedString;
        }
    }
}
