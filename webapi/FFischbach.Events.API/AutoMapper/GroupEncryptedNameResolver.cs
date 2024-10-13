using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.AutoMapper
{
    public class GroupEncryptedNameResolver : IValueResolver<GroupCreateModel, Group, byte[]>
    {
        public byte[] Resolve(GroupCreateModel source, Group destination, byte[] destMember, ResolutionContext context)
        {
            // Get public key from context.
            string publicKey = context.Items["PublicKey"] as string ?? throw new Exception("Missing public key on participant encryption.");

            // Import public key in pem format.
            using RSA rsa = RSA.Create();
            rsa.ImportFromPem(publicKey);

            // Parse string to byte array.
            byte[] data = Encoding.Default.GetBytes(source.Name!);

            // Encrypt data.
            destMember = rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256);

            return destMember;
        }
    }
}
