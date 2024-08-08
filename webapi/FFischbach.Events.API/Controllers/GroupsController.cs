using AutoMapper;
using FFischbach.Events.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;
using System.ComponentModel.DataAnnotations;

namespace FFischbach.Events.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    [Produces("application/json")]
    [RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class GroupsController(ILogger<RouteGroupContext> logger, IMapper mapper, DatabaseContext databaseContext) : ControllerBase
    {
        private ILogger<RouteGroupContext> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;

        // GET: <GroupsController>/5
        /// <summary>
        /// Gets a single group.
        /// </summary>
        /// <param name="id">Id of the group</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Models.OutputModels.GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.GroupDetailOutputModel>> Get([Required] int? id)
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

            // Get group from the database.
            Models.Group? dbGroup = (await DatabaseContext.Groups
                                    .Include(x => x.Participants!)
                                    .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == id));

            // Check db response.
            if (dbGroup == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
            {
                // Calling user is not an group manager of that group.
                return Forbid();
            }

            // Success. Map the response.
            Models.OutputModels.GroupDetailOutputModel returnValue = Mapper.Map<Models.OutputModels.GroupDetailOutputModel>(dbGroup);
            returnValue.TotalParticipants = dbGroup.Participants?.Count ?? 0;

            return Ok(returnValue);
        }

        // POST <GroupsController>
        /// <summary>
        /// Creates a group.
        /// </summary>
        /// <param name="group">The group to be created</param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<Models.OutputModels.GroupOutputModel>> Post([FromBody, Required] Models.InputModels.GroupCreateModel? group)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get event from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Event? dbEvent = (await DatabaseContext.Events.FirstOrDefaultAsync(x => x.Id.ToLower() == group!.EventId!.ToLower()));

            if (dbEvent == null)
            {
                // Event already exists.
                Logger.LogError("Attempt to create group for event '{EventId}' failed as the event could not be found.", group!.EventId);
                return Problem(title: "Event konnte nicht gefunden werden.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Map the group input.
            Models.Group dbGroup = Mapper.Map<Models.Group>(group, opt => opt.Items["PublicKey"] = dbEvent.PublicKey);

            // Check if the group already exists.
            if (await DatabaseContext.Groups.AnyAsync(x => x.HashedName == dbGroup!.HashedName && x.EventId.ToLower() == group!.EventId!.ToLower()))
            {
                // Group already exists.
                Logger.LogError("Attempt to create group '{GroupId}' failed as it already exists.", group!.Name);
                return Problem(title: "Dieser Gruppenname ist bereits vergeben.", statusCode: StatusCodes.Status400BadRequest);
            }
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

            // Create the group.
            DatabaseContext.Groups.Add(dbGroup);
            await DatabaseContext.SaveChangesAsync();

            return Created();
        }

        // POST <GroupsController>/5/Participant?isContact=false
        /// <summary>
        /// Adds a participant to an event.
        /// </summary>
        /// <param name="id">Id of the group</param>
        /// <param name="participant">The participant to be created</param>
        /// <param name="isContact">Value indicating if new participant should replace the current contact</param>
        /// 
        [HttpPost("{id}/Participant")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(Models.OutputModels.GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.GroupDetailOutputModel>> AddParticipant([Required] int? id, [FromBody, Required] Models.InputModels.ParticipantCreateModel? participant, [FromQuery] bool isContact = false)
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

            // Get group from the database.
            Models.Group? dbGroup = (await DatabaseContext.Groups
                                    .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == id));

            // Check db response.
            if (dbGroup == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
            {
                // Calling user is not an group manager of that group.
                return Forbid();
            }

            // Check if the contact should be changed.
            if (isContact)
            {
                // Get the current contact.
                Models.Participant? currentContact = await DatabaseContext.Participants.FirstOrDefaultAsync(x => x.GroupId == id && x.IsContact);

                if (currentContact != null)
                {
                    // Update contact state.
                    currentContact.IsContact = false;
                }
            }

            // Map the input.
            Models.Participant dbParticipant = Mapper.Map<Models.Participant>(participant!, opt => opt.Items["PublicKey"] = dbGroup.Event.PublicKey);
            dbParticipant.GroupId = dbGroup.Id;
            dbParticipant.IsContact = isContact;

            // Create the participant.
            DatabaseContext.Participants.Add(dbParticipant);
            await DatabaseContext.SaveChangesAsync();

            // Read the group from the database.
            dbGroup = (await DatabaseContext.Groups
                        .Include(x => x.Participants!)
                        .Include(x => x.Event!)
                            .ThenInclude(x => x.EventManagers!)
                                .ThenInclude(x => x.Manager)
                        .FirstOrDefaultAsync(x => x.Id == id));

            // Success. Map the response.
            Models.OutputModels.GroupDetailOutputModel returnValue = Mapper.Map<Models.OutputModels.GroupDetailOutputModel>(dbGroup);
            returnValue.TotalParticipants = dbGroup!.Participants?.Count ?? 0;

            return Ok(returnValue);
        }

        // PUT: <GroupsController>/5
        /// <summary>
        /// Updates a group and its participants.
        /// </summary>
        /// <param name="id">Id of the group</param>
        /// <param name="group">The updated group</param>
        /// <returns></returns>
        /// <remarks>You can update and remove participants here. New ones can only be added using the POST /Groups/{id}/Participant endpoint.</remarks>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Models.OutputModels.GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<Models.OutputModels.GroupDetailOutputModel>> Put([Required] int? id, [FromBody, Required] Models.InputModels.GroupUpdateModel? group)
        {
            try
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

                // Get group from the database.
                Models.Group? dbGroup = (await DatabaseContext.Groups
                                        .Include(x => x.Participants!)
                                        .Include(x => x.Event!)
                                            .ThenInclude(x => x.EventManagers!)
                                                .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id == id));

                // Check db response.
                if (dbGroup == null)
                {
                    // Nothing found.
                    return NotFound();
                }
                else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an group manager of that group.
                    return Forbid();
                }

                // Map the input.
                Models.Group inputGroup = Mapper.Map<Models.Group>(group!);

                // Create local mapper.
                IMapper updateMapper = new Mapper(new MapperConfiguration(c =>
                {
                    c.CreateMap<Models.Group, Models.Group>()
                        .ForMember(x => x.Id, y => y.Ignore())
                        .ForMember(x => x.EventId, y => y.Ignore())
                        .ForMember(x => x.Event, y => y.Ignore())
                        .ForMember(x => x.CreatedAt, y => y.Ignore())
                        .ForMember(x => x.Participants, y => y.Ignore());

                    c.CreateMap<Models.Participant, Models.Participant>()
                        .ForMember(x => x.Id, y => y.Ignore())
                        .ForMember(x => x.GroupId, y => y.Ignore())
                        .ForMember(x => x.Group, y => y.Ignore())
                        .ForMember(x => x.CreatedAt, y => y.Ignore());
                }));

                // Map the mapper input into the db value.
                updateMapper.Map(inputGroup, dbGroup!);

                // Map the participants.
                List<int> idsToRemove = [];
                foreach (Models.Participant dbParticipant in dbGroup.Participants!)
                {
                    // Get the corresponding input participant.
                    Models.Participant? inputParticipant = inputGroup.Participants!.FirstOrDefault(x => x.Id == dbParticipant.Id);

                    // Check if the participant can be found in input.
                    if (inputParticipant == null)
                    {
                        // Mark the participant as removed for later.
                        idsToRemove.Add(dbParticipant.Id);
                        continue;
                    }

                    // Update the participant.
                    updateMapper.Map(inputParticipant!, dbParticipant);
                }

                // Remove participants.
                foreach (int i in idsToRemove)
                {
                    Models.Participant dbParticipant = dbGroup.Participants.First(x => x.Id == i);
                    dbGroup.Participants.Remove(dbParticipant);
                }

                // Update the group.
                await DatabaseContext.SaveChangesAsync();

                // Read the group from the database.
                dbGroup = (await DatabaseContext.Groups
                            .Include(x => x.Participants!)
                            .Include(x => x.Event!)
                                .ThenInclude(x => x.EventManagers!)
                                    .ThenInclude(x => x.Manager)
                            .FirstOrDefaultAsync(x => x.Id == id));

                // Success. Map the response.
                Models.OutputModels.GroupDetailOutputModel returnValue = Mapper.Map<Models.OutputModels.GroupDetailOutputModel>(dbGroup);
                returnValue.TotalParticipants = dbGroup!.Participants?.Count ?? 0;

                return Ok(returnValue);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Unexpected exception while updating the group with id {id}", id);
                return Problem(detail: ex.Message, title: "Ein unerwarteter Fehler ist aufgetreten", statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        // DELETE <GroupsController>/5
        /// <summary>
        /// Deletes a group and all of its participants.
        /// </summary>
        /// <param name="id">Id of the group</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([Required] int? id)
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

            // Get group from the database.
            Models.Group? dbGroup = (await DatabaseContext.Groups
                                    .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == id));

            // Check db response.
            if (dbGroup == null)
            {
                // Nothing found.
                return NotFound();
            }
            else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
            {
                // Calling user is not an group manager of that group.
                return Forbid();
            }

            // Remove the group, resulting in a cascade of all participants.
            DatabaseContext.Groups.Remove(dbGroup);
            await DatabaseContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
