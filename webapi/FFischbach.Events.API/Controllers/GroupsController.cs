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
    [Route("api/[controller]")]
    [Produces("application/json")]
    [RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class GroupsController(ILogger<RouteGroupContext> logger, IMapper mapper, DatabaseContext databaseContext) : ControllerBase
    {
        private ILogger<RouteGroupContext> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;

        // GET: api/<GroupsController>/5
        /// <summary>
        /// Gets a single group.
        /// </summary>
        /// <param name="id"></param>
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
                return Problem(detail: "Unable to get display name from token.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Get group from the database.
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
            Models.Group? dbGroup = (await DatabaseContext.Groups
                                    .Include(x => x.Participants!)
                                    .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == id));
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons

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
            else
            {
                // Success. Map the response.
                return Ok(Mapper.Map<Models.OutputModels.GroupDetailOutputModel>(dbGroup));
            }
        }
    }
}
