using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using System.Security.Cryptography;
using System.Text;


namespace FFischbach.Events.API.AutoMapper
{
    public class GroupHashedNameResolver : IValueResolver<GroupCreateModel, Group, string>
    {
        public string Resolve(GroupCreateModel source, Group destination, string destMember, ResolutionContext context)
        {
            // Encode the name in base64 (this simplifies umlaut handling).
            string base64Name = Convert.ToBase64String(Encoding.UTF8.GetBytes(source.Name!));

            // Parse string to byte array.
            byte[] data = Encoding.Default.GetBytes(base64Name);

            // Hash data.
            byte[] hashedData = SHA256.HashData(data);

            // Convert byte array to a string
            StringBuilder builder = new StringBuilder();
            foreach (byte t in hashedData)
            {
                builder.Append(t.ToString("x2"));
            }

            destMember = builder.ToString();

            return destMember;
        }
    }
}
