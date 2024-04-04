using AutoMapper;
using FFischbach.Events.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public class EventsController : ControllerBase
    {
        private IMapper Mapper { get; }
        private DatabaseContext DatabaseContext { get; }

        public EventsController(IMapper mapper, DatabaseContext databaseContext)
        {
            Mapper = mapper;
            DatabaseContext = databaseContext;
        }

        // GET: api/<EventsController>
        /// <summary>
        /// Get all events.
        /// </summary>
        /// <param name="pkHash">Your rsa private keys hashed using SHA-256 to get all events you have the permissions for.</param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<Models.OutputModels.EventOutputModel>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Models.OutputModels.EventOutputModel>>> Get([FromQuery, Required, MinLength(1)] List<string>? pkHash)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get events from the database.
            return Ok(
                Mapper.Map<List<Models.OutputModels.EventOutputModel>>(
                    await DatabaseContext.Events.Where(x => pkHash!.Contains(x.PrivateKeyHash)).ToListAsync()));
        }

        // GET: api/<EventsController>/5
        /// <summary>
        /// Get a single event.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="pkHash">Your rsa private keys hashed using SHA-256 to get all events you have the permissions for.</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Models.OutputModels.EventOutputModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult<Models.OutputModels.EventOutputModel>> Get([Required] string? id, [FromQuery, Required] string? pkHash)
        {
            // Validate.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get event from the database.
            return Ok(
                Mapper.Map<Models.OutputModels.EventOutputModel>(
                    await DatabaseContext.Events.FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower() && x.PrivateKeyHash == pkHash)));
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
