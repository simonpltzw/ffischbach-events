using FFischbach.Events.API.Helpers;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IEventManagerService
    {
        /// <summary>
        /// Adds the <paramref name="email"/> as new event manager of the event with the given <paramref name="eventId"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="eventId"></param>
        /// <param name="email"></param>
        /// <exception cref="CustomException"></exception>
        Task AddEventManagerAsync(ClaimsPrincipal user, string eventId, string email);
    }
}