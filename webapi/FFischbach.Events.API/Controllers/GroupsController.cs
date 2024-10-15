using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public class GroupsController(IGroupService groupService, IParticipantService participantService) : ControllerBase
    {
        private IGroupService GroupService { get; set; } = groupService;
        private IParticipantService ParticipantService { get; set; } = participantService;

        /// <summary>
        /// Creates a group.
        /// </summary>
        /// <param name="group">The group to be created</param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Post([FromBody, Required] Models.InputModels.GroupCreateModel? group)
        {
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await GroupService.CreateGroupAsync(group!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Created();
        }

        /// <summary>
        /// Gets a single group.
        /// </summary>
        /// <param name="id">Id of the group</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<GroupDetailOutputModel>> Get([Required] int? id)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await GroupService.GetGroupAsync(User, (int)id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

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
        [ProducesResponseType(typeof(GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<GroupDetailOutputModel>> Put([Required] int? id, [FromBody, Required] Models.InputModels.GroupUpdateModel? group)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await GroupService.UpdateGroupAsync(User, (int)id!, group!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

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
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await GroupService.DeleteGroupAsync(User, (int)id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }

            return NoContent();
        }

        /// <summary>
        /// Adds a participant to an event.
        /// </summary>
        /// <param name="id">Id of the group</param>
        /// <param name="participant">The participant to be created</param>
        /// <param name="isContact">Value indicating if new participant should replace the current contact</param>
        /// 
        [HttpPost("{id}/Participant")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(GroupDetailOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<GroupDetailOutputModel>> AddParticipant([Required] int? id, [FromBody, Required] Models.InputModels.ParticipantCreateModel? participant, [FromQuery] bool isContact = false)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await ParticipantService.AddParticipantAsync(User, (int)id!, participant!, isContact);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }
    }
}
