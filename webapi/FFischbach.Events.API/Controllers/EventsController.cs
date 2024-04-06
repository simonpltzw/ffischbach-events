using AutoMapper;
using FFischbach.Events.API.Data;
using FFischbach.Events.API.Models;
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
                return Problem(detail: "Unable to get object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            if (!Guid.TryParse(objectIdString, out Guid objectId))
            {
                Logger.LogError("User token object id '{ObjectId}' can not be parsed to guid.", objectIdString);
                return Problem(detail: "Unable to parse object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get events from the database.
            return Ok(
                Mapper.Map<List<Models.OutputModels.EventListItemOutputModel>>(
                    await DatabaseContext.Events.Where(x => x.EventManagers!.Any(x => x.EntraObjectId == objectId)).ToListAsync()));
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
                return Problem(detail: "Unable to get object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            if (!Guid.TryParse(objectIdString, out Guid objectId))
            {
                Logger.LogError("User token object id '{ObjectId}' can not be parsed to guid.", objectIdString);
                return Problem(detail: "Unable to parse object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get event from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Event? dbEvent = (await DatabaseContext.Events
                                    .Include(x => x.Groups!)
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
            else if (!dbEvent.EventManagers!.Any(x => x.EntraObjectId == objectId))
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

        // POST api/<EventsController>
        /// <summary>
        /// Creates an event.
        /// </summary>
        /// <param name="event"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(Models.OutputModels.EventOutputModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Models.OutputModels.EventOutputModel>> Post([FromBody, Required] Models.InputModels.EventCreateModel @event)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if the event already exists.
            if (await DatabaseContext.Events.AnyAsync(x => x.Id == @event.Id))
            {
                // Event already exists.
                Logger.LogError("Attempt to create event '{EventId}' failed as it already exists.", @event.Id);
                return Problem(detail: "Event already exists.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get object id as guid.
            string? objectIdString = User.GetObjectId();

            // Forbid if object id not present.
            if (string.IsNullOrEmpty(objectIdString))
            {
                Logger.LogError("User token object id is null or empty.");
                return Problem(detail: "Unable to get object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            if (!Guid.TryParse(objectIdString, out Guid objectId))
            {
                Logger.LogError("User token object id '{ObjectId}' can not be parsed to guid.", objectIdString);
                return Problem(detail: "Unable to parse object id from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user with object id '{ObjectId}'.", objectIdString);
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Map the event input.
            Models.Event dbEvent = Mapper.Map<Models.Event>(@event, opt => opt.AfterMap((src, dest) => dest.CreatedBy = displayName));

            // Create the event.
            DatabaseContext.Events.Add(dbEvent);
            await DatabaseContext.SaveChangesAsync();

            // Add current user as event manager.
            EventManager eventManager = new EventManager
            {
                EntraObjectId = objectId,
                EventId = dbEvent.Id
            };

            // Create the event manager.
            DatabaseContext.EventManagers.Add(eventManager);
            await DatabaseContext.SaveChangesAsync();

            return Ok(dbEvent);
        }

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
