using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;

namespace FFischbach.Events.API.Tests.Controllers
{
    public class EventsControllerTests(ApiFactory factory) : ApiTestBase(factory)
    {
        #region POST /Events

        [Fact]
        public async Task Post_CreatesEventWithDefaultCategories_AndCallerAsManager()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Events", TestData.NewEvent("raup-2027"), Json, Ct);

            EventDetailOutputModel created = await ReadAsync<EventDetailOutputModel>(HttpStatusCode.Created, response);
            Assert.Equal("raup-2027", created.Id);
            Assert.Equal(TestData.Manager, created.CreatedBy);
            Assert.False(created.Completed);
            Assert.Equal(6, created.Categories.Count);
            Assert.Empty(created.Groups);   // An empty list, not null.
            Assert.Contains("[[ParticipantsTable]]", created.RegistrationEmailContent);
            Assert.EndsWith("/Events/raup-2027", response.Headers.Location?.ToString());

            List<string> managers = await Factory.QueryDbAsync(db => db.EventManagers
                .Where(x => x.EventId == "raup-2027")
                .Select(x => x.Manager!.Email)
                .ToListAsync(Ct));
            Assert.Equal([TestData.Manager], managers);
        }

        [Fact]
        public async Task Post_ExistingIdWithDifferentCasing_Returns400()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Events", TestData.NewEvent("RAUP-2027"), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_DateInThePast_Returns400()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Events", TestData.NewEvent("raup-2020", DateTime.UtcNow.AddDays(-1)), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_MissingRequiredFields_Returns400()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Events", new { id = "raup-2027" }, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_IdLongerThan20Characters_Returns400()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Events", TestData.NewEvent(new string('x', 21)), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        #endregion POST /Events

        #region GET /Events

        [Fact]
        public async Task GetAll_ReturnsOnlyEventsManagedByCaller_WithCounts()
        {
            (EventDetailOutputModel own, _) = await CreateEventWithGroupAsync("own-event");
            await CreateEventAsync("foreign-event", manager: TestData.OtherUser);

            List<EventOutputModel> events = await ReadAsync<List<EventOutputModel>>(HttpStatusCode.OK,
                await ManagerClient().GetAsync("/Events", Ct));

            EventOutputModel single = Assert.Single(events);
            Assert.Equal(own.Id, single.Id);
            Assert.Equal(1, single.TotalGroups);
            Assert.Equal(3, single.TotalParticipants);
        }

        [Fact]
        public async Task Get_ById_IsCaseInsensitive()
        {
            await CreateEventAsync("raup-2027");

            EventDetailOutputModel @event = await ReadAsync<EventDetailOutputModel>(HttpStatusCode.OK,
                await ManagerClient().GetAsync("/Events/RAUP-2027", Ct));

            Assert.Equal("raup-2027", @event.Id);
        }

        [Fact]
        public async Task Get_WithGroup_ReturnsGroupSummaryWithContactAndCounts()
        {
            (EventDetailOutputModel created, int groupId) = await CreateEventWithGroupAsync();

            EventDetailOutputModel @event = await ReadAsync<EventDetailOutputModel>(HttpStatusCode.OK,
                await ManagerClient().GetAsync($"/Events/{created.Id}", Ct));

            Assert.Equal(1, @event.TotalGroups);
            Assert.Equal(3, @event.TotalParticipants);
            GroupOutputModel group = Assert.Single(@event.Groups);
            Assert.Equal(groupId, group.Id);
            Assert.Equal(3, group.TotalParticipants);
            Assert.Equal(created.Categories[0].Id, group.Category.Id);
            Assert.Equal(created.Categories[0].Name, group.Category.Name);
            Assert.Contains("\"FirstName\":\"Max\"", TestData.Decrypt(group.Contact.EncryptedData));
            Assert.Equal(6, @event.Categories.Count);
            Assert.Equal(TestData.PublicKeyPem, @event.PublicKey);
        }

        [Fact]
        public async Task Get_UnknownId_Returns404()
        {
            HttpResponseMessage response = await ManagerClient().GetAsync("/Events/does-not-exist", Ct);

            await AssertStatusAsync(HttpStatusCode.NotFound, response);
        }

        [Fact]
        public async Task Get_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).GetAsync("/Events/raup-2027", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion GET /Events

        #region PUT /Events/{id}

        [Fact]
        public async Task Put_UpdatesEvent()
        {
            await CreateEventAsync("raup-2027");

            EventDetailOutputModel updated = await ReadAsync<EventDetailOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PutAsJsonAsync("/Events/raup-2027", TestData.UpdateEvent("Neue Beschreibung"), Json, Ct));

            Assert.Equal("Neue Beschreibung", updated.Description);
            Assert.Equal("<p>Hallo [[ContactFirstName]]</p>", updated.RegistrationEmailContent);
            Assert.Equal(TestData.Manager, updated.UpdatedBy);
            Assert.NotNull(updated.UpdatedAt);
        }

        [Fact]
        public async Task Put_DateInThePast_Returns400()
        {
            await CreateEventAsync("raup-2027");
            var update = TestData.UpdateEvent();
            update.Date = DateTime.UtcNow.AddDays(-1);

            HttpResponseMessage response = await ManagerClient().PutAsJsonAsync("/Events/raup-2027", update, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Put_WithoutEmailContents_Returns400()
        {
            await CreateEventAsync("raup-2027");
            var update = TestData.UpdateEvent();
            update.RegistrationEmailContent = null;

            HttpResponseMessage response = await ManagerClient().PutAsJsonAsync("/Events/raup-2027", update, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Put_Completed_AnonymizesGroupsAndBlocksFurtherChanges()
        {
            (EventDetailOutputModel @event, int groupId) = await CreateEventWithGroupAsync();

            await AssertStatusAsync(HttpStatusCode.OK,
                await ManagerClient().PutAsJsonAsync($"/Events/{@event.Id}", TestData.UpdateEvent(completed: true), Json, Ct));

            var group = await Factory.QueryDbAsync(db => db.Groups.Include(x => x.Participants).SingleAsync(x => x.Id == groupId, Ct));
            Assert.Empty(group.HashedName);
            Assert.Empty(group.EncryptedName);
            Assert.All(group.Participants!, p => Assert.Empty(p.EncryptedData));

            HttpResponseMessage secondUpdate = await ManagerClient().PutAsJsonAsync($"/Events/{@event.Id}", TestData.UpdateEvent(), Json, Ct);
            await AssertStatusAsync(HttpStatusCode.BadRequest, secondUpdate);
        }

        [Fact]
        public async Task Put_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PutAsJsonAsync("/Events/raup-2027", TestData.UpdateEvent(), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion PUT /Events/{id}

        #region DELETE /Events/{id}

        [Fact]
        public async Task Delete_RemovesEventWithGroupsAndParticipants()
        {
            (EventDetailOutputModel @event, _) = await CreateEventWithGroupAsync();

            await AssertStatusAsync(HttpStatusCode.NoContent, await ManagerClient().DeleteAsync($"/Events/{@event.Id}", Ct));

            await AssertStatusAsync(HttpStatusCode.NotFound, await ManagerClient().GetAsync($"/Events/{@event.Id}", Ct));
            Assert.Equal(0, await Factory.QueryDbAsync(db => db.Groups.CountAsync(Ct)));
            Assert.Equal(0, await Factory.QueryDbAsync(db => db.Participants.CountAsync(Ct)));
            Assert.Equal(0, await Factory.QueryDbAsync(db => db.Categories.CountAsync(Ct)));
        }

        [Fact]
        public async Task Delete_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).DeleteAsync("/Events/raup-2027", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion DELETE /Events/{id}

        #region GET /Events/{id}/signup-form.html

        [Fact]
        public async Task GetSignUpForm_IsAnonymous_AndContainsEventAndCategories()
        {
            EventDetailOutputModel @event = await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await AnonymousClient().GetAsync("/Events/raup-2027/signup-form.html", Ct);

            await AssertStatusAsync(HttpStatusCode.OK, response);
            Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
            string html = await response.Content.ReadAsStringAsync(Ct);
            Assert.Contains("const EVENT_ID = 'raup-2027';", html);
            Assert.Contains("<span>Testevent</span>", html);
            Assert.All(@event.Categories, c => Assert.Contains($"<option value=\"{c.Id}\"", html));
        }

        [Fact]
        public async Task GetSignUpForm_UnknownEvent_Returns404()
        {
            HttpResponseMessage response = await AnonymousClient().GetAsync("/Events/does-not-exist/signup-form.html", Ct);

            await AssertStatusAsync(HttpStatusCode.NotFound, response);
        }

        [Fact]
        public async Task GetSignUpForm_CompletedEvent_Returns400()
        {
            await CreateEventAsync("raup-2027");
            await ManagerClient().PutAsJsonAsync("/Events/raup-2027", TestData.UpdateEvent(completed: true), Json, Ct);

            HttpResponseMessage response = await AnonymousClient().GetAsync("/Events/raup-2027/signup-form.html", Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        #endregion GET /Events/{id}/signup-form.html

        #region POST /Events/{id}/EventManager

        [Fact]
        public async Task AddEventManager_GrantsAccessToNewManager()
        {
            await CreateEventAsync("raup-2027");

            await AssertStatusAsync(HttpStatusCode.NoContent,
                await ManagerClient().PostAsync($"/Events/raup-2027/EventManager?email={TestData.OtherUser}", null, Ct));

            await AssertStatusAsync(HttpStatusCode.OK, await ClientFor(TestData.OtherUser).GetAsync("/Events/raup-2027", Ct));
        }

        [Fact]
        public async Task AddEventManager_AlreadyManager_Returns400()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ManagerClient().PostAsync($"/Events/raup-2027/EventManager?email={TestData.Manager.ToUpper()}", null, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task AddEventManager_InvalidEmail_Returns400()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ManagerClient().PostAsync("/Events/raup-2027/EventManager?email=no-email", null, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task AddEventManager_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PostAsync($"/Events/raup-2027/EventManager?email={TestData.OtherUser}", null, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion POST /Events/{id}/EventManager

        #region Test mails

        [Fact]
        public async Task SendTestRegistrationMail_SendsDummyGroupToCaller()
        {
            await CreateEventAsync("raup-2027");

            await AssertStatusAsync(HttpStatusCode.NoContent,
                await ManagerClient().PostAsync("/Events/raup-2027/SendTestRegistrationMail", null, Ct));

            var mail = Assert.Single(Factory.Emails.RegistrationMails);
            Assert.Equal(TestData.Manager, mail.Group.Contact!.Email);
            Assert.Equal("raup-2027", mail.Event.Id);
        }

        [Fact]
        public async Task SendTestApprovalMail_SendsDummyGroupToCaller()
        {
            await CreateEventAsync("raup-2027");

            await AssertStatusAsync(HttpStatusCode.NoContent,
                await ManagerClient().PostAsync("/Events/raup-2027/SendTestApprovalMail", null, Ct));

            var mail = Assert.Single(Factory.Emails.ApprovalMails);
            Assert.Equal(TestData.Manager, mail.Group.Contact!.Email);
        }

        [Fact]
        public async Task SendTestRegistrationMail_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PostAsync("/Events/raup-2027/SendTestRegistrationMail", null, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
            Assert.Empty(Factory.Emails.RegistrationMails);
        }

        #endregion Test mails
    }
}
