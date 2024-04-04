using AutoMapper;

namespace FFischbach.Events.API.Services
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Models.InputModels.EventCreateModel, Models.Event>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.Now));
            CreateMap<Models.Event, Models.OutputModels.EventOutputModel>();

            CreateMap<Models.InputModels.GroupCreateModel, Models.Group>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.Now));
            CreateMap<Models.Group, Models.OutputModels.GroupOutputModel>();

            CreateMap<Models.InputModels.ParticipantCreateModel, Models.Participant>()
                .ForMember(x => x.EncryptedData, o => o.MapFrom<ParticipantEncryptionResolver>()); // Requires "PublicKey" as passed in Items dict.
            CreateMap<Models.Participant, Models.OutputModels.ParticipantOutputModel>();
        }
    }
}
