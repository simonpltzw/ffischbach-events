using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IEventService
    {
        /// <summary>
        /// Creates the given <paramref name="event"/> and adds the <paramref name="user"/> as an event manager.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="event"></param>
        /// <exception cref="CustomException"></exception>
        Task<EventDetailOutputModel> CreateEventAsync(ClaimsPrincipal user, EventCreateModel @event);

        /// <summary>
        /// Gets all events assigned to the given <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <exception cref="CustomException"></exception>
        Task<List<EventOutputModel>> GetEventsAsync(ClaimsPrincipal user);

        /// <summary>
        /// Gets an event by <paramref name="id"/> depending on the permissions of the <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <exception cref="CustomException"></exception>
        Task<EventDetailOutputModel> GetEventAsync(ClaimsPrincipal user, string id);

        /// <summary>
        /// Updates an event by <paramref name="id"/> depending on the permissions of the <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <param name="event"></param>
        /// <exception cref="CustomException"></exception>
        Task<EventDetailOutputModel> UpdateEventAsync(ClaimsPrincipal user, string id, EventUpdateModel @event);

        /// <summary>
        /// Deletes an event by <paramref name="id"/> depending on the permissions of the <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <exception cref="CustomException"></exception>
        Task DeleteEventAsync(ClaimsPrincipal user, string id);

        /// <summary>
        /// Gets the sign up form suited to the event with the given <paramref name="id"/>.
        /// </summary>
        /// <param name="id"></param>
        /// <returns>The html document as string.</returns>
        /// <exception cref="CustomException"></exception>
        Task<string> GetSignUpFormAsync(string id);
    }
}