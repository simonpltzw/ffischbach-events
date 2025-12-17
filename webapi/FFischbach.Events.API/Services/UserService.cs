using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.Identity.Web;
using System.Security.Claims;

namespace FFischbach.Events.API.Services
{
    internal class UserService : IUserService
    {
        public string GetDisplayName(ClaimsPrincipal user)
        {
            // Get the display name using microsofts built-in method.
            string? displayName = user.GetDisplayName();

            // Check if it could be found.
            if (string.IsNullOrEmpty(displayName))
            {
                throw new CustomException("Ein unerwarteter Fehler ist aufgetreten.", detail: "Unable to get display name from token.", statusCode: StatusCodes.Status403Forbidden);
            }

            return displayName;
        }
    }
}
