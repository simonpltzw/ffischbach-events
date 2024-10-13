using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IParticipantService
    {
        /// <summary>
        /// Adds the given <paramref name="participant"/> to the group with id <paramref name="groupId"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="groupId"></param>
        /// <param name="participant"></param>
        /// <param name="isContact">Indicates whether participant should be the groups contact.</param>
        /// <returns>The updated state of the group.</returns>
        /// <exception cref="CustomException"></exception>
        Task<GroupDetailOutputModel> AddParticipantAsync(ClaimsPrincipal user, int groupId, ParticipantCreateModel participant, bool isContact);
    }
}