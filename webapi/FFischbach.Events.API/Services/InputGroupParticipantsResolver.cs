using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;

namespace FFischbach.Events.API.Services
{
    public class InputGroupParticipantsResolver : IValueResolver<GroupCreateModel, Group, List<Participant>?>
    {
        public List<Participant>? Resolve(GroupCreateModel source, Group destination, List<Participant>? destMember, ResolutionContext context)
        {
            // Map list of participants first.
            List<Participant> result = context.Mapper.Map<List<Participant>>(source.Participants!);

            // Map contact alone.
            Participant contact = context.Mapper.Map<Participant>(source.Contact!);

            // Mark contact.
            contact.IsContact = true;

            // Add contact to result.
            result.Add(contact);

            return result;
        }
    }
}
