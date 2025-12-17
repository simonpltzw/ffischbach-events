using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IParticipantService
    {
        /// <summary>
        /// Adds the given <paramref name="participant"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="participant"></param>
        /// <param name="isContact">Indicates whether participant should be the groups contact.</param>
        /// <returns>The created participant.</returns>
        /// <exception cref="CustomException"></exception>
        Task<ParticipantOutputModel> CreateParticipantAsync(ClaimsPrincipal user, ParticipantCreateModel participant, bool isContact);
    }
}