using FFischbach.Events.API.Tests.Infrastructure;
using System.Net;

namespace FFischbach.Events.API.Tests.Controllers
{
    /// <summary>
    /// Checks the login requirements that apply to all protected endpoints.
    /// </summary>
    public class AuthenticationTests(ApiFactory factory) : ApiTestBase(factory)
    {
        [Theory]
        [InlineData("GET", "/Events")]
        [InlineData("GET", "/Events/raup-2027")]
        [InlineData("DELETE", "/Events/raup-2027")]
        [InlineData("GET", "/Categories/1")]
        [InlineData("GET", "/Groups/1")]
        [InlineData("DELETE", "/Groups/1")]
        public async Task ProtectedEndpoint_WithoutLogin_Returns401(string method, string url)
        {
            HttpResponseMessage response = await AnonymousClient().SendAsync(new HttpRequestMessage(new HttpMethod(method), url), Ct);

            await AssertStatusAsync(HttpStatusCode.Unauthorized, response);
        }

        [Fact]
        public async Task UnverifiedEmail_Returns403()
        {
            HttpResponseMessage response = await ClientFor(TestData.Manager, emailVerified: false).GetAsync("/Events", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        [Fact]
        public async Task Health_IsAnonymous_AndReportsDatabaseHealthy()
        {
            HttpResponseMessage response = await AnonymousClient().GetAsync("/health", Ct);

            await AssertStatusAsync(HttpStatusCode.OK, response);
            Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(Ct));
        }
    }
}
