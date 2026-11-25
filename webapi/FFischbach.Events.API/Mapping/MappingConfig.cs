using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using Mapster;

namespace FFischbach.Events.API.Mapping
{
    /// <summary>
    /// Mapster configuration of all mappings of the API.
    /// </summary>
    /// <remarks>Properties with the same name are mapped automatically, only deviations are configured here.</remarks>
    public static class MappingConfig
    {
        /// <summary>
        /// Creates and compiles the configuration. Compiling fails fast on startup if a mapping is invalid.
        /// </summary>
        public static TypeAdapterConfig Create()
        {
            TypeAdapterConfig config = new TypeAdapterConfig();

            RegisterCategoryMappings(config);
            RegisterEventMappings(config);
            RegisterGroupMappings(config);
            RegisterParticipantMappings(config);

            config.Compile();
            return config;
        }

        private static void RegisterCategoryMappings(TypeAdapterConfig config)
        {
            config.NewConfig<CategoryCreateModel, Category>()
                .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);

            config.NewConfig<CategoryUpdateModel, Category>();

            config.NewConfig<Category, CategoryOutputModel>();
        }

        private static void RegisterEventMappings(TypeAdapterConfig config)
        {
            config.NewConfig<EventCreateModel, Event>()
                .Map(dest => dest.Completed, _ => false)
                .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
                .Map(dest => dest.RegistrationEmailContent, _ => DefaultEmailContents.Registration)
                .Map(dest => dest.ApprovalEmailContent, _ => DefaultEmailContents.Approval);

            config.NewConfig<EventUpdateModel, Event>();

            // Collections that were not loaded are returned as empty lists, not null.
            config.NewConfig<Event, EventDetailOutputModel>()
                .Map(dest => dest.Groups, src => src.Groups ?? new List<Group>())
                .Map(dest => dest.Categories, src => src.Categories ?? new List<Category>());

            config.NewConfig<Event, EventOutputModel>();

            config.NewConfig<Event, GroupEventOutputModel>();
        }

        private static void RegisterGroupMappings(TypeAdapterConfig config)
        {
            // Requires the event's public key as parameter, see EventEncryption.PublicKeyParameter.
            // The contact is stored as participant with IsContact = true, after the other participants.
            config.NewConfig<GroupCreateModel, Group>()
                .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
                .Map(dest => dest.HashedName, src => EventEncryption.HashName(src.Name!))
                .Map(dest => dest.EncryptedName, src => EventEncryption.EncryptName(src.Name!))
                .Map(dest => dest.Participants, src => (src.Participants ?? new List<ParticipantGroupCreateModel>()).Append(src.Contact!))
                .AfterMapping((_, dest) => MarkLastParticipantAsContact(dest));

            config.NewConfig<GroupUpdateModel, Group>()
                .Map(dest => dest.Participants, src => (src.Participants ?? new List<ParticipantUpdateModel>()).Append(src.Contact!))
                .AfterMapping((_, dest) => MarkLastParticipantAsContact(dest));

            config.NewConfig<Group, GroupOutputModel>()
                .Map(dest => dest.Contact, src => src.Participants == null ? null : src.Participants.First(x => x.IsContact));

            config.NewConfig<Group, GroupDetailOutputModel>()
                .Map(dest => dest.Contact, src => src.Participants == null ? null : src.Participants.First(x => x.IsContact))
                .Map(dest => dest.Participants, src => (src.Participants ?? new List<Participant>()).Where(x => !x.IsContact).ToList());
        }

        private static void RegisterParticipantMappings(TypeAdapterConfig config)
        {
            // Requires the event's public key as parameter, see EventEncryption.PublicKeyParameter.
            config.NewConfig<ParticipantInputModel, Participant>()
                .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow)
                .Map(dest => dest.EncryptedData, src => EventEncryption.EncryptParticipant(src));

            config.NewConfig<ParticipantCreateModel, Participant>()
                .Inherits<ParticipantInputModel, Participant>();

            config.NewConfig<ParticipantGroupCreateModel, Participant>()
                .Inherits<ParticipantInputModel, Participant>();

            config.NewConfig<ParticipantUpdateModel, Participant>();

            config.NewConfig<Participant, ParticipantOutputModel>();
        }

        private static void MarkLastParticipantAsContact(Group group)
        {
            if (group.Participants is { Count: > 0 } participants)
            {
                participants[^1].IsContact = true;
            }
        }
    }
}
