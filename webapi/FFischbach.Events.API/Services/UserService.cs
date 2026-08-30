using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Services.Interfaces;
using System.Security.Claims;

namespace FFischbach.Events.API.Services
{
    internal class UserService : IUserService
    {
        public string GetEmail(ClaimsPrincipal user)
        {
            // Get the display name using microsofts built-in method.
            string? email = user.Claims.FirstOrDefault(c => c.Type == "https://palzone.de/email")?.Value;
            bool emailVerified = bool.TryParse(user.Claims.FirstOrDefault(c => c.Type == "https://palzone.de/email_verified")?.Value, out bool result) && result;
            string? displayName = user.Identity?.Name;

            // Check if it could be found.
            if (string.IsNullOrEmpty(email))
            {
                throw new CustomException("Ein unerwarteter Fehler ist aufgetreten.", detail: "Unable to get email from token.", statusCode: StatusCodes.Status403Forbidden);
            }
            else if (!emailVerified)
            {
                throw new CustomException("Ein unerwarteter Fehler ist aufgetreten.", detail: "Email not yet verified.", statusCode: StatusCodes.Status403Forbidden);
            }

            return email;
        }
    }
}
