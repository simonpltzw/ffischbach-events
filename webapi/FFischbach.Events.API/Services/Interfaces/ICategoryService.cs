using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface ICategoryService
    {
        /// <summary>
        /// Creates a category.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="category"></param>
        /// <returns>The created category.</returns>
        /// <exception cref="CustomException"></exception>
        Task<CategoryOutputModel> CreateCategoryAsync(ClaimsPrincipal user, CategoryCreateModel category);

        /// <summary>
        /// Updates the category.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <param name="category"></param>
        /// <returns>The updated category.</returns>
        /// <exception cref="CustomException"></exception>
        Task<CategoryOutputModel> UpdateCategoryAsync(ClaimsPrincipal user, int id, CategoryUpdateModel category);

        /// <summary>
        /// Deletes the category.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <exception cref="CustomException"></exception>
        Task DeleteCategoryAsync(ClaimsPrincipal user, int id);
    }
}