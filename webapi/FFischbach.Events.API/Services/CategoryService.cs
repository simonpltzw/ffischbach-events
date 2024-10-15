using AutoMapper;
using FFischbach.Events.API.Data;
using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FFischbach.Events.API.Services
{
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
    public class CategoryService(ILogger<CategoryService> logger, IMapper mapper, DatabaseContext databaseContext, IUserService userService) : ICategoryService
    {
        private ILogger<CategoryService> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;

        public async Task<CategoryOutputModel> CreateCategoryAsync(ClaimsPrincipal user, CategoryCreateModel category)
        {
            CategoryOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events
                                        .Include(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                        .Include(x => x.Categories)
                                        .FirstOrDefaultAsync(x => x.Id.ToLower() == category.EventId!.ToLower());

                // Check db response.
                if (dbEvent == null)
                {
                    // Nothing found.
                    throw new CustomException("Das Event konnte nicht gefunden werden.", statusCode: StatusCodes.Status400BadRequest);
                }
                else if (!dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für dieses Event. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Map the category.
                Category mappedCategory = Mapper.Map<Category>(category);
                mappedCategory.CreatedBy = displayName;

                // Add the category to the event.
                dbEvent.Categories!.Add(mappedCategory);

                // Update the database.
                await DatabaseContext.SaveChangesAsync();

                // Return the created category.
                returnValue = Mapper.Map<CategoryOutputModel>(mappedCategory);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to create category '{name}' for event '{id}'.", category.Name, category.EventId);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to create category '{name}' for event '{id}'.", category.Name, category.EventId);
                throw new CustomException("Unerwarteter Fehler beim Erstellen der Kategorie.", ex);
            }
            return returnValue;
        }

        public async Task<CategoryOutputModel> UpdateCategoryAsync(ClaimsPrincipal user, int id, CategoryUpdateModel category)
        {
            CategoryOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get category from the database.
                Category? dbCategory = await DatabaseContext.Categories
                                                .Include(x => x.Event!)
                                                    .ThenInclude(x => x.EventManagers!)
                                                        .ThenInclude(x => x.Manager)
                                                .FirstOrDefaultAsync(x => x.Id == id);

                // Check db response.
                if (dbCategory == null)
                {
                    // Nothing found.
                    throw new CustomException("Die Kategorie konnte nicht gefunden werden.", statusCode: StatusCodes.Status404NotFound);
                }
                else if (!dbCategory.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für dieses Event. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Map the input into the database model.
                Mapper.Map(category, dbCategory);

                // Update trackables.
                dbCategory.UpdatedBy = displayName;
                dbCategory.UpdatedAt = DateTime.UtcNow;

                // Save the changes in the database.
                await DatabaseContext.SaveChangesAsync();

                // Use the database loaded category as return value.
                returnValue = Mapper.Map<CategoryOutputModel>(dbCategory);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to update category '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to update category '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Aktualisieren der Kategorie.", ex);
            }
            return returnValue;
        }

        public async Task DeleteCategoryAsync(ClaimsPrincipal user, int id)
        {
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get category from the database.
                Category? dbCategory = await DatabaseContext.Categories
                                                .Include(x => x.Event!)
                                                    .ThenInclude(x => x.EventManagers!)
                                                        .ThenInclude(x => x.Manager)
                                                .Include(x => x.Groups)
                                                .FirstOrDefaultAsync(x => x.Id == id);

                // Check db response.
                if (dbCategory == null)
                {
                    // Nothing found.
                    throw new CustomException("Die Kategorie konnte nicht gefunden werden.", statusCode: StatusCodes.Status404NotFound);
                }
                else if (!dbCategory.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für dieses Event. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Check if there are any groups assigned to this category at the moment.
                if (dbCategory.Groups!.Count != 0)
                {
                    // Still groups assigned.
                    throw new CustomException("Die Kategorie konnte nicht gelöscht werden, solange ihr noch Gruppen zugewiesen sind.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Remove the category.
                DatabaseContext.Categories.Remove(dbCategory);

                // Save the changes in the database.
                await DatabaseContext.SaveChangesAsync();
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to update category '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to update category '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Aktualisieren der Kategorie.", ex);
            }
        }
    }
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
}
