using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace FFischbach.Events.API.Tests.Infrastructure
{
    /// <summary>
    /// Fake login for tests: the user is taken from a request header instead of an Auth0 token.
    /// </summary>
    /// <remarks>
    /// Produces the same claims the API reads from Auth0 tokens (see UserService).
    /// Requests without the header stay anonymous, so [Authorize] endpoints answer with 401.
    /// </remarks>
    public class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        public const string SchemeName = "Test";
        public const string UserHeader = "X-Test-User";
        public const string EmailVerifiedHeader = "X-Test-Email-Verified";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            string? email = Request.Headers[UserHeader];
            if (string.IsNullOrEmpty(email))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            string emailVerified = Request.Headers[EmailVerifiedHeader].ToString() == "false" ? "false" : "true";

            Claim[] claims =
            [
                new Claim(ClaimTypes.NameIdentifier, $"auth0|{email}"),
                new Claim("https://palzone.de/email", email),
                new Claim("https://palzone.de/email_verified", emailVerified)
            ];

            ClaimsIdentity identity = new ClaimsIdentity(claims, SchemeName, ClaimTypes.NameIdentifier, ClaimTypes.Role);
            AuthenticationTicket ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
