using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;

namespace FFischbach.Events.API.Services
{
    public class GroupCreateParticipantsResolver : IValueResolver<GroupCreateModel, Group, List<Participant>?>
    {
        public List<Participant>? Resolve(GroupCreateModel source, Group destination, List<Participant>? destMember, ResolutionContext context)
        {
            destMember = new List<Participant>();

            // Map list of participants first.
            if (source.Participants != null)
            {
                destMember.AddRange(context.Mapper.Map<List<Participant>>(source.Participants!));
            }

            // Map contact alone.
            Participant contact = context.Mapper.Map<Participant>(source.Contact!);

            // Mark contact.
            contact.IsContact = true;

            // Add contact to result.
            destMember.Add(contact);

            return destMember;
        }
    }
}
