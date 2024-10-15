using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;

namespace FFischbach.Events.API.AutoMapper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Category.
            CreateMap<CategoryCreateModel, Category>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));

            CreateMap<CategoryUpdateModel, Category>();

            CreateMap<Category, CategoryOutputModel>();

            // Event.
            CreateMap<EventCreateModel, Event>()
                .ForMember(x => x.Completed, o => o.MapFrom(x => false))
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));

            CreateMap<EventUpdateModel, Event>();

            CreateMap<Event, EventDetailOutputModel>();

            CreateMap<Event, EventOutputModel>();

            CreateMap<Event, GroupEventOutputModel>();

            // Group.
            CreateMap<GroupCreateModel, Group>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.HashedName, o => o.MapFrom<GroupHashedNameResolver>())
                .ForMember(x => x.EncryptedName, o => o.MapFrom<GroupEncryptedNameResolver>())
                .ForMember(x => x.Participants, o => o.MapFrom<GroupCreateParticipantsResolver>());

            CreateMap<GroupUpdateModel, Group>()
                .ForMember(x => x.Participants, o => o.MapFrom<GroupUpdateParticipantsResolver>());

            CreateMap<Group, GroupOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)));

            CreateMap<Group, GroupDetailOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)))
                .ForMember(x => x.Participants, o => o.MapFrom(x => x.Participants!.Where(y => !y.IsContact).ToList()));

            // Participant.
            CreateMap<ParticipantCreateModel, Participant>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.EncryptedData, o => o.MapFrom<ParticipantEncryptedDataResolver>()); // Requires "PublicKey" as passed in Items dict.

            CreateMap<ParticipantUpdateModel, Participant>();

            CreateMap<Participant, ParticipantOutputModel>();
        }
    }
}
