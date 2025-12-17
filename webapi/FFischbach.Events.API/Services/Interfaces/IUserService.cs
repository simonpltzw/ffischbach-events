using FFischbach.Events.API.Helpers;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IUserService
    {
        /// <summary>
        /// Gets the users display name by look at the given <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <returns>The display name of the current user.</returns>
        /// <exception cref="CustomException">When the user display name could not be found.</exception>
        string GetDisplayName(ClaimsPrincipal user);
    }
}
