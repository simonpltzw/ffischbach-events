using AutoMapper;
using FFischbach.Events.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;
using System.ComponentModel.DataAnnotations;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FFischbach.Events.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class EventsController(ILogger<EventsController> logger, IMapper mapper, DatabaseContext databaseContext) : ControllerBase
    {
        private ILogger<EventsController> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;

        // GET: api/<EventsController>
        /// <summary>
        /// Gets all events.
        /// </summary>
        /// <remarks>Events are filtered on behalf of the calling user's permissions.</remarks>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(List<Models.OutputModels.EventListItemOutputModel>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Models.OutputModels.EventListItemOutputModel>>> Get()
        {
            // Get object id as guid.
            string? objectIdString = User.GetObjectId();

            // Forbid if object id not present.
            if (string.IsNullOrEmpty(objectIdString)) 
            {
                Logger.LogError("User token object id is null or empty.");
                return BadRequest();
            }

            if (!Guid.TryParse(objectIdString, out Guid objectId))
            {
                Logger.LogError("User token object id '{ObjectId}' can not be parsed to guid.", objectIdString);
                return BadRequest();
            }

            // Get events from the database.
            return Ok(
                Mapper.Map<List<Models.OutputModels.EventListItemOutputModel>>(
                    await DatabaseContext.Events.Where(x => x.EventManagers.Any(x => x.EntraObjectId == objectId)).ToListAsync()));
        }

        // GET: api/<EventsController>/5
        /// <summary>
        /// Gets a single event.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Models.OutputModels.EventOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.EventOutputModel>> Get([Required] string? id)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get object id as guid.
            string? objectIdString = User.GetObjectId();

            // Forbid if object id not present.
            if (string.IsNullOrEmpty(objectIdString))
            {
                Logger.LogError("User token object id is null or empty.");
                return BadRequest();
            }

            if (!Guid.TryParse(objectIdString, out Guid objectId))
            {
                Logger.LogError("User token object id '{ObjectId}' can not be parsed to guid.", objectIdString);
                return BadRequest();
            }

            // Get event from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Event? dbEvent = (await DatabaseContext.Events
                                    .Include(x => x.Groups)
                                        .ThenInclude(x => x.Participants)
                                    .Include(x => x.EventManagers)
                                    .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower()));
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

            // Check db response.
            if (dbEvent == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbEvent.EventManagers.Any(x => x.EntraObjectId == objectId))
            {
                // Calling user is not an event manager of that group.
                return Forbid();
            }
            else
            {
                // Success. Map the response.
                return Ok(Mapper.Map<Models.OutputModels.EventOutputModel>(dbEvent));
            }
        }

        //// POST api/<EventsController>
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        //// PUT api/<EventsController>/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value)
        //{
        //}

        //// DELETE api/<EventsController>/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
