using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;
using System.ComponentModel.DataAnnotations;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FFischbach.Events.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    [RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest, "application/json")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized, "application/json")]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError, "application/json")]
    public class EventsController(IEventService eventService, IEventManagerService eventManagerService) : ControllerBase
    {
        private IEventService EventService { get; } = eventService;
        private IEventManagerService EventManagerService { get; } = eventManagerService;

        /// <summary>
        /// Creates an event.
        /// </summary>
        /// <param name="event">The event to be created</param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(EventDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<EventDetailOutputModel>> Post([FromBody, Required] EventCreateModel @event)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await EventService.CreateEventAsync(User, @event);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return CreatedAtAction(nameof(Get), new { id = returnValue.Id }, returnValue);
        }

        /// <summary>
        /// Gets all events.
        /// </summary>
        /// <remarks>Events are filtered on behalf of the calling user's permissions.</remarks>
        [HttpGet]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(List<EventOutputModel>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<EventOutputModel>>> Get()
        {
            List<EventOutputModel> returnValue;
            try
            {
                returnValue = await EventService.GetEventsAsync(User);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

        /// <summary>
        /// Gets a single event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(EventDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<EventDetailOutputModel>> Get([Required] string? id)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await EventService.GetEventAsync(User, id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

        /// <summary>
        /// Updates an event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <param name="event"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(EventDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<EventDetailOutputModel>> Put([Required] string? id, [Required] EventUpdateModel? @event)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await EventService.UpdateEventAsync(User, id!, @event!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

        /// <summary>
        /// Deletes an event as well as all connected groups and participants.
        /// </summary>
        /// <param name="id">Id of the event</param>
        [HttpDelete("{id}")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([Required] string? id)
        {
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await EventService.DeleteEventAsync(User, id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return NoContent();
        }

        /// <summary>
        /// Gets the sign up form suited to the request event.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/signup-form.html")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound, "application/json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError, "application/json")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK, contentType: "text/html")]
        public async Task<IActionResult> GetSignUpForm([Required] string? id)
        {
            string returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await EventService.GetSignUpFormAsync(id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Content(returnValue, "text/html");
        }

        /// <summary>
        /// Adds a new manager to an event.
        /// </summary>
        /// <param name="id">Id of the event</param>
        /// <param name="email">Email of the manager</param>
        /// <remarks>Permit other users to manage the event using their email.</remarks>
        [HttpPost("{id}/EventManager")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddEventManager([Required] string? id, [FromQuery, Required, EmailAddress] string? email)
        {
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await EventManagerService.AddEventManagerAsync(User, id!, email!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return NoContent();
        }
    }
}
