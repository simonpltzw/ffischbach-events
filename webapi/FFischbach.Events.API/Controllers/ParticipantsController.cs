using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
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
    public class ParticipantsController(IParticipantService participantService) : ControllerBase
    {
        private IParticipantService ParticipantService { get; } = participantService;

        /// <summary>
        /// Creates a participant.
        /// </summary>
        /// <param name="participant">The participant to be created</param>
        /// <param name="isContact">Value indicating if the new participant should replace the current contact of the group</param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ParticipantOutputModel), StatusCodes.Status200OK)]
        public async Task<IActionResult> Post([FromBody, Required] ParticipantCreateModel? participant, [FromQuery] bool isContact = false)
        {
            ParticipantOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await ParticipantService.CreateParticipantAsync(User, participant!, isContact);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }
    }
}
