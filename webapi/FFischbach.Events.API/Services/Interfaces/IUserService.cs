using FFischbach.Events.API.Helpers;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IUserService
    {
        /// <summary>
        /// Gets the users email by looking at the given <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <returns>The email of the current user.</returns>
        /// <exception cref="CustomException">When the user emailcould not be found.</exception>
        string GetEmail(ClaimsPrincipal user);
    }
}
