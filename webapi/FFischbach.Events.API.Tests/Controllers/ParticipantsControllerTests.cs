using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;

namespace FFischbach.Events.API.Tests.Controllers
{
    public class ParticipantsControllerTests(ApiFactory factory) : ApiTestBase(factory)
    {
        private static ParticipantCreateModel NewParticipant(int groupId, string? email = null) => new()
        {
            GroupId = groupId,
            FirstName = "Lisa",
            LastName = "Löffler",
            Email = email,
            BirthDate = new DateOnly(2001, 3, 15)
        };

        [Fact]
        public async Task Post_AddsEncryptedParticipantToGroup()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            ParticipantOutputModel created = await ReadAsync<ParticipantOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PostAsJsonAsync("/Participants", NewParticipant(groupId), Json, Ct));

            // The UI decrypts this JSON, so its format must stay exactly the same.
            Assert.Equal($"{{\"GroupId\":{groupId},\"Email\":null,\"FirstName\":\"Lisa\",\"LastName\":\"Löffler\",\"BirthDate\":\"2001-03-15\"}}",
                TestData.Decrypt(created.EncryptedData));
            Assert.False(created.VIP ?? false);
            Assert.Equal(4, await Factory.QueryDbAsync(db => db.Participants.CountAsync(x => x.GroupId == groupId, Ct)));
        }

        [Fact]
        public async Task Post_AsContact_ReplacesCurrentContact()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            ParticipantOutputModel created = await ReadAsync<ParticipantOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PostAsJsonAsync("/Participants?isContact=true", NewParticipant(groupId, "lisa@example.com"), Json, Ct));

            int contactId = await Factory.QueryDbAsync(db => db.Participants.Where(x => x.GroupId == groupId && x.IsContact).Select(x => x.Id).SingleAsync(Ct));
            Assert.Equal(created.Id, contactId);
        }

        [Fact]
        public async Task Post_AsContactWithoutEmail_Returns400()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Participants?isContact=true", NewParticipant(groupId), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_UnknownGroup_Returns404()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Participants", NewParticipant(9999), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.NotFound, response);
        }

        [Fact]
        public async Task Post_AsNonManager_Returns403()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PostAsJsonAsync("/Participants", NewParticipant(groupId), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        [Fact]
        public async Task Post_WithoutLogin_Returns401()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Participants", NewParticipant(groupId), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Unauthorized, response);
            Assert.Equal(3, await Factory.QueryDbAsync(db => db.Participants.CountAsync(x => x.GroupId == groupId, Ct)));
        }

        [Fact]
        public async Task Post_CompletedEvent_Returns400()
        {
            (EventDetailOutputModel @event, int groupId) = await CreateEventWithGroupAsync();
            await AssertStatusAsync(HttpStatusCode.OK,
                await ManagerClient().PutAsJsonAsync($"/Events/{@event.Id}", TestData.UpdateEvent(completed: true), Json, Ct));

            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Participants", NewParticipant(groupId), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }
    }
}
