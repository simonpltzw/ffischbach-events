using FFischbach.Events.API.Data;
using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FFischbach.Events.API.Services
{
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
    public class EventManagerService(ILogger<EventManagerService> logger, DatabaseContext databaseContext, IUserService userService) : IEventManagerService
    {
        private ILogger<EventManagerService> Logger { get; } = logger;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;

        public async Task AddEventManagerAsync(ClaimsPrincipal user, string eventId, string email)
        {
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get event from the database.
                Event? dbEvent = (await DatabaseContext.Events
                                        .Include(x => x.Groups!)
                                            .ThenInclude(x => x.Participants)   // Include the participants to calculate the count.
                                        .Include(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id.ToLower() == eventId!.ToLower()));

                // Check db response.
                if (dbEvent == null)
                {
                    // Nothing found.
                    throw new CustomException("Das Event konnte nicht gefunden werden.", statusCode: StatusCodes.Status404NotFound);
                }
                else if (!dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für dieses Event. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }
                else if (dbEvent.EventManagers!.Any(x => x.Manager!.Email.Equals(email, StringComparison.CurrentCultureIgnoreCase)))
                {
                    throw new CustomException("Dieser Nutzer ist bereits ein Manager des Events.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Check if the email is already a manager.
                Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == email!.ToLower());
                if (manager == null)
                {
                    // Add current user as manager.
                    manager = new Manager
                    {
                        Email = email!,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Create the manager.
                    DatabaseContext.Managers.Add(manager);
                    await DatabaseContext.SaveChangesAsync();
                }

                // Create the event manager.
                EventManager eventManager = new EventManager
                {
                    EventId = dbEvent.Id,
                    ManagerId = manager.Id,
                    CreatedAt = DateTime.UtcNow
                };

                DatabaseContext.EventManagers.Add(eventManager);
                await DatabaseContext.SaveChangesAsync();
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to add '{email}' as manager of event '{id}'.", email, eventId);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to add '{email}' as manager of event '{id}'.", email, eventId);
                throw new CustomException("Unerwarteter Fehler beim Hinzufügen des Event Managers.", ex);
            }
        }
    }
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
}
