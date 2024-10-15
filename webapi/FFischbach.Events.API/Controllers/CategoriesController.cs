using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Services;
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
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class CategoriesController(ICategoryService categoryService) : ControllerBase
    {
        private ICategoryService CategoryService { get; } = categoryService;

        /// <summary>
        /// Creates a category.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(CategoryOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<CategoryOutputModel>> Post([FromBody, Required] CategoryCreateModel category)
        {
            CategoryOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await CategoryService.CreateCategoryAsync(User, category);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

        /// <summary>
        /// Updates a category.
        /// </summary>
        /// <param name="id">Id of the category</param>
        /// <param name="category">The updated category</param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(CategoryOutputModel), StatusCodes.Status200OK)]
        public async Task<ActionResult<CategoryOutputModel>> Put([Required] int? id, [FromBody, Required] CategoryUpdateModel? category)
        {
            CategoryOutputModel returnValue;
            try
            {
                // Validate.
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                returnValue = await CategoryService.UpdateCategoryAsync(User, (int)id!, category!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return Ok(returnValue);
        }

        /// <summary>
        /// Deletes a category.
        /// </summary>
        /// <param name="id">Id of the category</param>
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

                await CategoryService.DeleteCategoryAsync(User, (int)id!);
            }
            catch (CustomException ex)
            {
                return Problem(detail: ex.Detail, title: ex.Message, statusCode: ex.StatusCode);
            }
            return NoContent();
        }
    }
}
