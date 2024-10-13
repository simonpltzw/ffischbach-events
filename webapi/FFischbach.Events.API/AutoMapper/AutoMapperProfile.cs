using AutoMapper;

namespace FFischbach.Events.API.AutoMapper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Event.
            CreateMap<Models.InputModels.EventCreateModel, Models.Event>()
                .ForMember(x => x.Completed, o => o.MapFrom(x => false))
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));

            CreateMap<Models.Event, Models.OutputModels.EventDetailOutputModel>();

            CreateMap<Models.Event, Models.OutputModels.EventOutputModel>();

            CreateMap<Models.Event, Models.OutputModels.GroupEventOutputModel>();

            // Group.
            CreateMap<Models.InputModels.GroupCreateModel, Models.Group>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.HashedName, o => o.MapFrom<GroupHashedNameResolver>())
                .ForMember(x => x.EncryptedName, o => o.MapFrom<GroupEncryptedNameResolver>())
                .ForMember(x => x.Participants, o => o.MapFrom<GroupCreateParticipantsResolver>());

            CreateMap<Models.InputModels.GroupUpdateModel, Models.Group>()
                .ForMember(x => x.Participants, o => o.MapFrom<GroupUpdateParticipantsResolver>());

            CreateMap<Models.Group, Models.OutputModels.GroupOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)));

            CreateMap<Models.Group, Models.OutputModels.GroupDetailOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)))
                .ForMember(x => x.Participants, o => o.MapFrom(x => x.Participants!.Where(y => !y.IsContact).ToList()));

            // Participant.
            CreateMap<Models.InputModels.ParticipantCreateModel, Models.Participant>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.EncryptedData, o => o.MapFrom<ParticipantEncryptedDataResolver>()); // Requires "PublicKey" as passed in Items dict.

            CreateMap<Models.InputModels.ParticipantUpdateModel, Models.Participant>();

            CreateMap<Models.Participant, Models.OutputModels.ParticipantOutputModel>();
        }
    }
}
