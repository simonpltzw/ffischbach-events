using FFischbach.Events.API.Models;
using Mapster;

namespace FFischbach.Events.API.Mapping
{
    /// <summary>
    /// Copies the changeable values of a mapped group update into the tracked database entities.
    /// </summary>
    /// <remarks>Keys, relations and creation data of the database entities stay untouched.</remarks>
    internal static class GroupUpdateMappingConfig
    {
        public static TypeAdapterConfig Instance { get; } = Create();

        private static TypeAdapterConfig Create()
        {
            TypeAdapterConfig config = new TypeAdapterConfig();

            config.NewConfig<Group, Group>()
                .Ignore(
                    x => x.Id,
                    x => x.EventId,
                    x => x.Event!,
                    x => x.Category!,
                    x => x.CreatedAt,
                    x => x.Participants!);

            config.NewConfig<Participant, Participant>()
                .Ignore(
                    x => x.Id,
                    x => x.GroupId,
                    x => x.Group!,
                    x => x.CreatedAt);

            config.Compile();
            return config;
        }
    }
}
