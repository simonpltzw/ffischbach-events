using FFischbach.Events.API.Models.OutputModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace FFischbach.Events.API.Tests.Infrastructure
{
    /// <summary>
    /// Base class for endpoint tests. Every test starts with a new, empty in-memory database.
    /// </summary>
    public abstract class ApiTestBase(ApiFactory factory) : IClassFixture<ApiFactory>, IAsyncLifetime
    {
        protected ApiFactory Factory { get; } = factory;

        protected static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        protected static CancellationToken Ct => TestContext.Current.CancellationToken;

        public async ValueTask InitializeAsync() => await Factory.ResetAsync();

        public ValueTask DisposeAsync()
        {
            GC.SuppressFinalize(this);
            return ValueTask.CompletedTask;
        }

        protected HttpClient ClientFor(string? email, bool emailVerified = true) => Factory.CreateClientFor(email, emailVerified);

        protected HttpClient ManagerClient() => ClientFor(TestData.Manager);

        protected HttpClient AnonymousClient() => ClientFor(null);

        /// <summary>
        /// Fails with the response body in the message, so a failing test shows the API's error.
        /// </summary>
        protected static async Task AssertStatusAsync(HttpStatusCode expected, HttpResponseMessage response)
        {
            if (response.StatusCode != expected)
            {
                string body = await response.Content.ReadAsStringAsync(Ct);
                Assert.Fail($"Expected {(int)expected} {expected}, got {(int)response.StatusCode} {response.StatusCode}.{Environment.NewLine}{body}");
            }
        }

        protected static async Task<T> ReadAsync<T>(HttpStatusCode expected, HttpResponseMessage response)
        {
            await AssertStatusAsync(expected, response);
            T? value = await response.Content.ReadFromJsonAsync<T>(Json, Ct);
            Assert.NotNull(value);
            return value;
        }

        protected static Task<ProblemDetails> ReadProblemAsync(HttpStatusCode expected, HttpResponseMessage response)
            => ReadAsync<ProblemDetails>(expected, response);

        #region Arrange helpers (go through the real endpoints)

        /// <summary>
        /// Creates an event via POST /Events. The creator becomes its manager.
        /// </summary>
        protected async Task<EventDetailOutputModel> CreateEventAsync(string id = "raup-2027", string manager = TestData.Manager)
        {
            HttpResponseMessage response = await ClientFor(manager).PostAsJsonAsync("/Events", TestData.NewEvent(id), Json, Ct);
            return await ReadAsync<EventDetailOutputModel>(HttpStatusCode.Created, response);
        }

        /// <summary>
        /// Registers a group anonymously via POST /Groups and returns its id.
        /// </summary>
        protected async Task<int> CreateGroupAsync(string eventId, int categoryId, string name = "Löschzug Süd")
        {
            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups", TestData.NewGroup(eventId, categoryId, name), Json, Ct);
            await AssertStatusAsync(HttpStatusCode.Created, response);

            // POST /Groups returns no body and the name is stored encrypted, so take the newest id.
            return await Factory.QueryDbAsync(db => db.Groups.MaxAsync(x => x.Id, Ct));
        }

        /// <summary>
        /// Creates an event (with its default categories) and registers one group in its first category.
        /// </summary>
        protected async Task<(EventDetailOutputModel Event, int GroupId)> CreateEventWithGroupAsync(string eventId = "raup-2027")
        {
            EventDetailOutputModel @event = await CreateEventAsync(eventId);
            int groupId = await CreateGroupAsync(@event.Id, @event.Categories[0].Id);
            return (@event, groupId);
        }

        #endregion Arrange helpers
    }
}
