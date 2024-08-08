using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Services
{
    public class ParticipantEncryptedDataResolver : IValueResolver<ParticipantCreateModel, Participant, byte[]>
    {
        public byte[] Resolve(ParticipantCreateModel source, Participant destination, byte[] destMember, ResolutionContext context)
        {
            // Get public key from context.
            string publicKey = context.Items["PublicKey"] as string ?? throw new Exception("Missing public key on participant encryption.");

            // Import public key in pem format.
            using RSA rsa = RSA.Create();
            rsa.ImportFromPem(publicKey);

            // Parse create model to json.
            string json = JsonConvert.SerializeObject(source);

            // Parse json to byte array.
            byte[] data = Encoding.Default.GetBytes(json);

            // Encrypt data.
            destMember = rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256);

            return destMember;
        }
    }
}
