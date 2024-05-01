using AutoMapper;

namespace FFischbach.Events.API.Services
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Models.InputModels.EventCreateModel, Models.Event>()
                .ForMember(x => x.Completed, o => o.MapFrom(x => false))
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));
            CreateMap<Models.Event, Models.OutputModels.EventOutputModel>();
            CreateMap<Models.Event, Models.OutputModels.EventListItemOutputModel>();

            CreateMap<Models.InputModels.GroupCreateModel, Models.Group>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.Participants, o => o.MapFrom<InputGroupParticipantsResolver>());
            CreateMap<Models.Group, Models.OutputModels.GroupOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)));
            CreateMap<Models.Group, Models.OutputModels.GroupDetailOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)))
                .ForMember(x => x.Participants, o => o.MapFrom(x => x.Participants!.Where(y => !y.IsContact).ToList()));

            CreateMap<Models.InputModels.ParticipantCreateModel, Models.Participant>()
                .ForMember(x => x.EncryptedData, o => o.MapFrom<ParticipantEncryptionResolver>()) // Requires "PublicKey" as passed in Items dict.
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));
            CreateMap<Models.Participant, Models.OutputModels.ParticipantOutputModel>();
        }
    }
}
