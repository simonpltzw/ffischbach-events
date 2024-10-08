﻿using AutoMapper;
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
    [Route("[controller]")]
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

        // GET: <EventsController>
        /// <summary>
        /// Gets all events.
        /// </summary>
        /// <remarks>Events are filtered on behalf of the calling user's permissions.</remarks>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(List<Models.OutputModels.EventOutputModel>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Models.OutputModels.EventOutputModel>>> Get()
        {
            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
            }

#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            // Get group and participant counts.
            List<Models.OutputModels.EventOutputModel> counts = await DatabaseContext.Events
                .Where(x => x.EventManagers!.Any(x => x.Manager!.Email.ToLower() == displayName.ToLower()))
                .Select(x => new Models.OutputModels.EventOutputModel { 
                    Id = x.Id, 
                    TotalGroups = x.Groups!.Count, 
                    TotalParticipants = x.Groups!.Sum(y => y.Participants!.Count), 
                    CreatedAt = x.CreatedAt })
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            // Get events.
            List<Models.OutputModels.EventOutputModel> returnValue = 
                Mapper.Map<List<Models.OutputModels.EventOutputModel>>(
                    await DatabaseContext.Events
                    .Where(x => x.EventManagers!.Any(x => x.Manager!.Email.ToLower() == displayName.ToLower()))
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync());
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

            // Merge lists.
            foreach(Models.OutputModels.EventOutputModel item in returnValue)
            {
                // Get corresponding count.
                Models.OutputModels.EventOutputModel? count = counts.FirstOrDefault(x => x.Id == item.Id);

                if (count != null)
                {
                    item.TotalGroups = count.TotalGroups;
                    item.TotalParticipants = count.TotalParticipants;
                }
            }

            return Ok(returnValue);

        }

        // GET: <EventsController>/5
        /// <summary>
        /// Gets a single event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Models.OutputModels.EventDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.EventDetailOutputModel>> Get([Required] string? id)
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
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
            }

#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            // Get event from the database.
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

            // Success. Map the response.
            Models.OutputModels.EventDetailOutputModel returnValue = Mapper.Map<Models.OutputModels.EventDetailOutputModel>(dbEvent);

            // Get the total amounts.
            int totalParticipants = 0;
            for (int i = 0; i < returnValue.Groups.Count; i++)
            {
                // Get participant amount of this group.
                int? groupParticipants = dbEvent.Groups?[i]?.Participants?.Count;
                if (!groupParticipants.HasValue) groupParticipants = 0;

                // Add to total for event.
                totalParticipants += (int)groupParticipants;

                returnValue.Groups[i].TotalParticipants = (int)groupParticipants;
            }

            // Merge with counts.
            returnValue.TotalGroups = returnValue.Groups.Count;
            returnValue.TotalParticipants = totalParticipants;

            return Ok(returnValue);
        }

        // POST <EventsController>
        /// <summary>
        /// Creates an event.
        /// </summary>
        /// <param name="event">The event to be created</param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(Models.OutputModels.EventDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.EventDetailOutputModel>> Post([FromBody, Required] Models.InputModels.EventCreateModel @event)
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
                return Problem(detail: "Event already exists.", title: "Dieses Event existiert bereits.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get display name.
            string? displayName = User.GetDisplayName();

            if (string.IsNullOrEmpty(displayName))
            {
                Logger.LogError("Could not get display name of user.");
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Check if the current user is already a manager.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == displayName.ToLower());
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            if (manager == null)
            {
                // Add current user as manager.
                manager = new Models.Manager
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
            Models.EventManager eventManager = new Models.EventManager
            {
                EventId = dbEvent.Id,
                ManagerId = manager.Id,
                CreatedAt = DateTime.UtcNow
            };

            DatabaseContext.EventManagers.Add(eventManager);
            await DatabaseContext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = dbEvent.Id }, Mapper.Map<Models.OutputModels.EventDetailOutputModel>(dbEvent));
        }

        // POST <EventsController>/5/EventManager
        /// <summary>
        /// Adds a new manager to an event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <param name="email">Email of the manager</param>
        /// <remarks>Permit other users to manage the event using their email.</remarks>
        [HttpPost("{id}/EventManager")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
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
                return Problem(detail: "User is already a manager of this event.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Check if the email is already a manager.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == email!.ToLower());
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            if (manager == null)
            {
                // Add current user as manager.
                manager = new Models.Manager
                {
                    Email = email!,
                    CreatedAt = DateTime.UtcNow
                };

                // Create the manager.
                DatabaseContext.Managers.Add(manager);
                await DatabaseContext.SaveChangesAsync();
            }

            // Create the event manager.
            Models.EventManager eventManager = new Models.EventManager
            {
                EventId = dbEvent.Id,
                ManagerId = manager.Id,
                CreatedAt = DateTime.UtcNow
            };

            DatabaseContext.EventManagers.Add(eventManager);
            await DatabaseContext.SaveChangesAsync();

            return NoContent();
        }

        // POST <EventsController>/5/EventManager
        /// <summary>
        /// Completes an event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        [HttpPost("{id}/Complete")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<Models.OutputModels.EventDetailOutputModel>> Complete([Required] string? id)
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
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
            }

#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            // Get event from the database.
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

            // Update the completed value.
            dbEvent.Completed = true;
            DatabaseContext.Events.Update(dbEvent);
            await DatabaseContext.SaveChangesAsync();

            return NoContent();
        }

        // DELETE <EventsController>/5
        /// <summary>
        /// Deletes an event as well as all connected groups and participants.
        /// </summary>
        /// <param name="id">Id of the event</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([Required] string? id)
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
                return Problem(detail: "Unable to get display name from token.", title: "Ein unerwarteter Fehler ist aufgetreten.", statusCode: StatusCodes.Status400BadRequest);
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

            // Remove the event, resulting in a cascade of all groups and participants as well as event managers.
            DatabaseContext.Events.Remove(dbEvent);
            await DatabaseContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
