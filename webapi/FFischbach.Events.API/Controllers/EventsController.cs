﻿using AutoMapper;
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
            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get events from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            return Ok(
                Mapper.Map<List<Models.OutputModels.EventListItemOutputModel>>(
                    await DatabaseContext.Events.Where(x => x.EventManagers!.Any(x => x.Manager!.Email.ToLower() == displayName.ToLower())).ToListAsync()));
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
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

            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get event from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Event? dbEvent = (await DatabaseContext.Events
                                    .Include(x => x.Groups!)
                                        .ThenInclude(x => x.Participants)
                                    .Include(x => x.EventManagers!)
                                        .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower()));
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

            // Check db response.
            if (dbEvent == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
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

            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Check if the current user is already a manager.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == displayName.ToLower());
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            if (manager == null)
            {
                // Add current user as manager.
                manager = new Manager
                {
                    Email = displayName,
                    CreatedAt = DateTime.UtcNow
                };

                // Create the manager.
                DatabaseContext.Managers.Add(manager);
                await DatabaseContext.SaveChangesAsync();
            }

            // Map the event input.
            Models.Event dbEvent = Mapper.Map<Models.Event>(@event, opt => opt.AfterMap((src, dest) => dest.CreatedBy = displayName));

            // Create the event.
            DatabaseContext.Events.Add(dbEvent);
            await DatabaseContext.SaveChangesAsync();

            // Create the event manager.
            EventManager eventManager = new EventManager
            {
                EventId = dbEvent.Id,
                ManagerId = manager.Id,
                CreatedAt = DateTime.UtcNow
            };

            DatabaseContext.EventManagers.Add(eventManager);
            await DatabaseContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = dbEvent.Id }, Mapper.Map<Models.OutputModels.EventOutputModel>(dbEvent));
        }

        // POST api/<EventsController>/5/EventManager
        /// <summary>
        /// Adds a new manager to an event.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="email"></param>
        /// <remarks>Permit other users to manage the event using their email.</remarks>
        [HttpPost("{id}/EventManager")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> AddEventManager([Required] string? id, [FromQuery, Required, EmailAddress] string? email)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get event from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Event? dbEvent = (await DatabaseContext.Events
                                    .Include(x => x.EventManagers!)
                                        .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower()));
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

            // Check db response.
            if (dbEvent == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
            {
                // Calling user is not an event manager of that group.
                return Forbid();
            }
            else if (dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(email, StringComparison.CurrentCultureIgnoreCase)))
            {
                return Problem(detail: "User is already a manager of this event.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Check if the email is already a manager.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == email!.ToLower());
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            if (manager == null)
            {
                // Add current user as manager.
                manager = new Manager
                {
                    Email = email!,
                    CreatedAt = DateTime.UtcNow
                };

                // Create the manager.
                DatabaseContext.Managers.Add(manager);
                await DatabaseContext.SaveChangesAsync();
            }

            // Create the event manager.
            EventManager eventManager = new EventManager
            {
                EventId = dbEvent.Id,
                ManagerId = manager.Id,
                CreatedAt = DateTime.UtcNow
            };

            DatabaseContext.EventManagers.Add(eventManager);
            await DatabaseContext.SaveChangesAsync();

            return NoContent();
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