using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;

namespace FFischbach.Events.API.Tests.Controllers
{
    public class GroupsControllerTests(ApiFactory factory) : ApiTestBase(factory)
    {
        /// <summary>
        /// Builds an update body from the current state of the group, the way the UI does.
        /// </summary>
        private static GroupUpdateModel ToUpdateModel(GroupDetailOutputModel group) => new()
        {
            HashedName = group.HashedName,
            EncryptedName = group.EncryptedName,
            CategoryId = group.Category.Id,
            Approved = group.Approved,
            Contact = new ParticipantUpdateModel { Id = group.Contact.Id, EncryptedData = group.Contact.EncryptedData, VIP = group.Contact.VIP },
            Participants = group.Participants
                .Select(p => new ParticipantUpdateModel { Id = p.Id, EncryptedData = p.EncryptedData, VIP = p.VIP })
                .ToList()
        };

        private async Task<GroupDetailOutputModel> GetGroupAsync(int id)
            => await ReadAsync<GroupDetailOutputModel>(HttpStatusCode.OK, await ManagerClient().GetAsync($"/Groups/{id}", Ct));

        #region POST /Groups

        [Fact]
        public async Task Post_IsAnonymous_StoresEncryptedGroupAndSendsRegistrationMail()
        {
            EventDetailOutputModel @event = await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups",
                TestData.NewGroup(@event.Id, @event.Categories[0].Id, "Löschzug Süd"), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Created, response);

            var group = await Factory.QueryDbAsync(db => db.Groups.Include(x => x.Participants).SingleAsync(Ct));
            Assert.Equal(3, group.Participants!.Count);
            Assert.Single(group.Participants, p => p.IsContact);

            // The name is stored encrypted with the event's public key and as SHA-256 hash for duplicate checks.
            Assert.Equal("Löschzug Süd", TestData.Decrypt(group.EncryptedName));
            string base64Name = Convert.ToBase64String(Encoding.UTF8.GetBytes("Löschzug Süd"));
            Assert.Equal(Convert.ToHexStringLower(SHA256.HashData(Encoding.Default.GetBytes(base64Name))), group.HashedName);

            // The UI decrypts this JSON, so its format must stay exactly the same.
            Assert.Equal("{\"Email\":\"max@example.com\",\"FirstName\":\"Max\",\"LastName\":\"Mustermann\",\"BirthDate\":\"2000-01-01\"}",
                TestData.Decrypt(group.Participants.Single(p => p.IsContact).EncryptedData));
            Assert.Equal(
                [
                    "{\"Email\":null,\"FirstName\":\"Erika\",\"LastName\":\"Musterfrau\",\"BirthDate\":\"1999-05-04\"}",
                    "{\"Email\":null,\"FirstName\":\"Jürgen\",\"LastName\":\"Groß\",\"BirthDate\":\"1985-12-24\"}"
                ],
                group.Participants.Where(p => !p.IsContact).OrderBy(p => p.Id).Select(p => TestData.Decrypt(p.EncryptedData)));

            var mail = Assert.Single(Factory.Emails.RegistrationMails);
            Assert.Equal("max@example.com", mail.Group.Contact!.Email);
        }

        [Fact]
        public async Task Post_DuplicateName_Returns400()
        {
            (EventDetailOutputModel @event, _) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups",
                TestData.NewGroup(@event.Id, @event.Categories[0].Id, "Löschzug Süd"), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_UnknownEvent_Returns400()
        {
            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups", TestData.NewGroup("does-not-exist", 1), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_CategoryOfOtherEvent_Returns400()
        {
            await CreateEventAsync("raup-2027");
            EventDetailOutputModel other = await CreateEventAsync("other-event");

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups",
                TestData.NewGroup("raup-2027", other.Categories[0].Id), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Theory]
        [InlineData(1, 2)]     // sign up has not started yet
        [InlineData(-2, -1)]   // sign up is already over
        public async Task Post_OutsideSignUpPeriod_Returns400(int fromDays, int toDays)
        {
            await CreateEventAsync("raup-2027");
            CategoryOutputModel category = await ReadAsync<CategoryOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PostAsJsonAsync("/Categories", new CategoryCreateModel
                {
                    Name = "Geschlossen",
                    EventId = "raup-2027",
                    SignUpFrom = DateTime.UtcNow.AddDays(fromDays),
                    SignUpTo = DateTime.UtcNow.AddDays(toDays)
                }, Json, Ct));

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups", TestData.NewGroup("raup-2027", category.Id), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
            Assert.Empty(Factory.Emails.RegistrationMails);
        }

        [Fact]
        public async Task Post_WithoutContact_Returns400()
        {
            EventDetailOutputModel @event = await CreateEventAsync("raup-2027");
            GroupCreateModel group = TestData.NewGroup(@event.Id, @event.Categories[0].Id);
            group.Contact = null;

            HttpResponseMessage response = await AnonymousClient().PostAsJsonAsync("/Groups", group, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        #endregion POST /Groups

        #region GET /Groups/{id}

        [Fact]
        public async Task Get_ReturnsGroupWithContactSeparatedFromParticipants()
        {
            (EventDetailOutputModel @event, int groupId) = await CreateEventWithGroupAsync();

            GroupDetailOutputModel group = await GetGroupAsync(groupId);

            Assert.Equal(@event.Id, group.Event.Id);
            Assert.Equal(@event.Categories[0].Id, group.Category.Id);
            Assert.Equal(2, group.Participants.Count);
            Assert.DoesNotContain(group.Participants, p => p.Id == group.Contact.Id);
        }

        [Fact]
        public async Task Get_UnknownId_Returns404()
        {
            HttpResponseMessage response = await ManagerClient().GetAsync("/Groups/9999", Ct);

            await AssertStatusAsync(HttpStatusCode.NotFound, response);
        }

        [Fact]
        public async Task Get_AsNonManager_Returns403()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).GetAsync($"/Groups/{groupId}", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion GET /Groups/{id}

        #region PUT /Groups/{id}

        [Fact]
        public async Task Put_ApprovesGroupAndRemovesMissingParticipants()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();
            GroupDetailOutputModel group = await GetGroupAsync(groupId);
            GroupUpdateModel update = ToUpdateModel(group);
            update.Approved = true;
            update.Participants!.RemoveAt(0);
            update.Contact!.VIP = true;

            GroupDetailOutputModel updated = await ReadAsync<GroupDetailOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PutAsJsonAsync($"/Groups/{groupId}", update, Json, Ct));

            Assert.True(updated.Approved);
            Assert.True(updated.Contact.VIP);
            Assert.Single(updated.Participants);
            Assert.Equal(TestData.Manager, updated.UpdatedBy);
            Assert.Equal(2, await Factory.QueryDbAsync(db => db.Participants.CountAsync(Ct)));
        }

        [Fact]
        public async Task Put_CategoryOfOtherEvent_Returns400()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();
            EventDetailOutputModel other = await CreateEventAsync("other-event");
            GroupUpdateModel update = ToUpdateModel(await GetGroupAsync(groupId));
            update.CategoryId = other.Categories[0].Id;

            HttpResponseMessage response = await ManagerClient().PutAsJsonAsync($"/Groups/{groupId}", update, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Put_AsNonManager_Returns403()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();
            GroupUpdateModel update = ToUpdateModel(await GetGroupAsync(groupId));

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PutAsJsonAsync($"/Groups/{groupId}", update, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion PUT /Groups/{id}

        #region DELETE /Groups/{id}

        [Fact]
        public async Task Delete_RemovesGroupAndParticipants()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            await AssertStatusAsync(HttpStatusCode.NoContent, await ManagerClient().DeleteAsync($"/Groups/{groupId}", Ct));

            await AssertStatusAsync(HttpStatusCode.NotFound, await ManagerClient().GetAsync($"/Groups/{groupId}", Ct));
            Assert.Equal(0, await Factory.QueryDbAsync(db => db.Participants.CountAsync(Ct)));
        }

        [Fact]
        public async Task Delete_AsNonManager_Returns403()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).DeleteAsync($"/Groups/{groupId}", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        #endregion DELETE /Groups/{id}

        #region POST /Groups/{id}/SendApproval

        [Fact]
        public async Task SendApproval_ApprovedGroup_SendsApprovalMail()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();
            GroupUpdateModel update = ToUpdateModel(await GetGroupAsync(groupId));
            update.Approved = true;
            await AssertStatusAsync(HttpStatusCode.OK, await ManagerClient().PutAsJsonAsync($"/Groups/{groupId}", update, Json, Ct));

            await AssertStatusAsync(HttpStatusCode.NoContent,
                await ManagerClient().PostAsJsonAsync($"/Groups/{groupId}/SendApproval", TestData.ApproveGroup(), Json, Ct));

            var mail = Assert.Single(Factory.Emails.ApprovalMails);
            Assert.Equal("Löschzug Süd", mail.Group.Name);
        }

        [Fact]
        public async Task SendApproval_NotApprovedGroup_Returns403()
        {
            (_, int groupId) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync($"/Groups/{groupId}/SendApproval", TestData.ApproveGroup(), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
            Assert.Empty(Factory.Emails.ApprovalMails);
        }

        #endregion POST /Groups/{id}/SendApproval
    }
}
