using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Tests.Infrastructure;
using System.Net;
using System.Net.Http.Json;

namespace FFischbach.Events.API.Tests.Controllers
{
    public class CategoriesControllerTests(ApiFactory factory) : ApiTestBase(factory)
    {
        private static CategoryCreateModel NewCategory(string eventId, DateTime? from = null, DateTime? to = null) => new()
        {
            Name = "Jugendfeuerwehr",
            EventId = eventId,
            SignUpFrom = from ?? DateTime.UtcNow,
            SignUpTo = to ?? DateTime.UtcNow.AddDays(30)
        };

        private async Task<CategoryOutputModel> CreateCategoryAsync(string eventId)
            => await ReadAsync<CategoryOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PostAsJsonAsync("/Categories", NewCategory(eventId), Json, Ct));

        [Fact]
        public async Task Post_CreatesCategory_VisibleOnEvent()
        {
            await CreateEventAsync("raup-2027");

            CategoryOutputModel created = await CreateCategoryAsync("raup-2027");

            Assert.Equal("Jugendfeuerwehr", created.Name);
            Assert.Equal(TestData.Manager, created.CreatedBy);
            EventDetailOutputModel @event = await ReadAsync<EventDetailOutputModel>(HttpStatusCode.OK,
                await ManagerClient().GetAsync("/Events/raup-2027", Ct));
            Assert.Contains(@event.Categories, c => c.Id == created.Id);
        }

        [Fact]
        public async Task Post_SignUpEndBeforeStart_Returns400()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Categories",
                NewCategory("raup-2027", from: DateTime.UtcNow.AddDays(2), to: DateTime.UtcNow.AddDays(1)), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_UnknownEvent_Returns400()
        {
            HttpResponseMessage response = await ManagerClient().PostAsJsonAsync("/Categories", NewCategory("does-not-exist"), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Post_AsNonManager_Returns403()
        {
            await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).PostAsJsonAsync("/Categories", NewCategory("raup-2027"), Json, Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        [Fact]
        public async Task Get_ReturnsCategory()
        {
            await CreateEventAsync("raup-2027");
            CategoryOutputModel created = await CreateCategoryAsync("raup-2027");

            CategoryOutputModel category = await ReadAsync<CategoryOutputModel>(HttpStatusCode.OK,
                await ManagerClient().GetAsync($"/Categories/{created.Id}", Ct));

            Assert.Equal(created.Name, category.Name);
        }

        [Fact]
        public async Task Get_UnknownId_Returns404()
        {
            HttpResponseMessage response = await ManagerClient().GetAsync("/Categories/9999", Ct);

            await AssertStatusAsync(HttpStatusCode.NotFound, response);
        }

        [Fact]
        public async Task Get_AsNonManager_Returns403()
        {
            EventDetailOutputModel @event = await CreateEventAsync("raup-2027");

            HttpResponseMessage response = await ClientFor(TestData.OtherUser).GetAsync($"/Categories/{@event.Categories[0].Id}", Ct);

            await AssertStatusAsync(HttpStatusCode.Forbidden, response);
        }

        [Fact]
        public async Task Put_UpdatesCategory()
        {
            await CreateEventAsync("raup-2027");
            CategoryOutputModel created = await CreateCategoryAsync("raup-2027");

            CategoryOutputModel updated = await ReadAsync<CategoryOutputModel>(HttpStatusCode.OK,
                await ManagerClient().PutAsJsonAsync($"/Categories/{created.Id}", new CategoryUpdateModel
                {
                    Name = "Umbenannt",
                    SignUpFrom = DateTime.UtcNow,
                    SignUpTo = DateTime.UtcNow.AddDays(5)
                }, Json, Ct));

            Assert.Equal("Umbenannt", updated.Name);
            Assert.Equal(TestData.Manager, updated.UpdatedBy);
        }

        [Fact]
        public async Task Put_SignUpEndBeforeStart_Returns400()
        {
            await CreateEventAsync("raup-2027");
            CategoryOutputModel created = await CreateCategoryAsync("raup-2027");

            HttpResponseMessage response = await ManagerClient().PutAsJsonAsync($"/Categories/{created.Id}", new CategoryUpdateModel
            {
                Name = "Umbenannt",
                SignUpFrom = DateTime.UtcNow.AddDays(5),
                SignUpTo = DateTime.UtcNow
            }, Json, Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }

        [Fact]
        public async Task Delete_RemovesCategory()
        {
            await CreateEventAsync("raup-2027");
            CategoryOutputModel created = await CreateCategoryAsync("raup-2027");

            await AssertStatusAsync(HttpStatusCode.NoContent, await ManagerClient().DeleteAsync($"/Categories/{created.Id}", Ct));

            await AssertStatusAsync(HttpStatusCode.NotFound, await ManagerClient().GetAsync($"/Categories/{created.Id}", Ct));
        }

        [Fact]
        public async Task Delete_WithAssignedGroups_Returns400()
        {
            (EventDetailOutputModel @event, _) = await CreateEventWithGroupAsync();

            HttpResponseMessage response = await ManagerClient().DeleteAsync($"/Categories/{@event.Categories[0].Id}", Ct);

            await AssertStatusAsync(HttpStatusCode.BadRequest, response);
        }
    }
}
