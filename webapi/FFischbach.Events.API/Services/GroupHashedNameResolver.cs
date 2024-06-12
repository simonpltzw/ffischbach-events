using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using System.Security.Cryptography;
using System.Text;


namespace FFischbach.Events.API.Services
{
    public class GroupHashedNameResolver : IValueResolver<GroupCreateModel, Group, string>
    {
        public string Resolve(GroupCreateModel source, Group destination, string destMember, ResolutionContext context)
        {
            // Initialize hashing algorithm

            // Parse string to byte array.
            byte[] data = Encoding.Default.GetBytes(source.Name!);

            // Hash data.
            byte[] hashedData = SHA256.HashData(data);

            // Convert byte array to a string
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < hashedData.Length; i++)
            {
                builder.Append(hashedData[i].ToString("x2"));
            }

            destMember = builder.ToString();

            return destMember;
        }
    }
}
