using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.AutoMapper
{
    public class ParticipantEncryptedDataResolver : IValueResolver<ParticipantInputModel, Participant, byte[]>
    {
        public byte[] Resolve(ParticipantInputModel source, Participant destination, byte[] destMember, ResolutionContext context)
        {
            // Get public key from context.
            string publicKey = context.Items["PublicKey"] as string ?? throw new Exception("Missing public key on participant encryption.");

            // Import public key in pem format.
            using RSA rsa = RSA.Create();
            rsa.ImportFromPem(publicKey);

            // Parse create model to json.
            string json = JsonConvert.SerializeObject(source);
            
            // Encode the json in base64 (this simplifies umlaut handling).
            string base64Json = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

            // Parse json to byte array.
            byte[] data = Encoding.Default.GetBytes(base64Json);

            // Encrypt data.
            destMember = rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256);

            return destMember;
        }
    }
}
