using AutoMapper;
using FFischbach.Events.API.Data;
using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace FFischbach.Events.API.Services
{
#pragma warning disable CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
    internal class EventService(ILogger<EventService> logger, IMapper mapper, DatabaseContext databaseContext, IUserService userService) : IEventService
    {
        private ILogger<EventService> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;

        public async Task<EventDetailOutputModel> CreateEventAsync(ClaimsPrincipal user, EventCreateModel @event)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Check if the event already exists.
                if (await DatabaseContext.Events.AnyAsync(x => x.Id == @event.Id))
                {
                    // Event already exists.
                    throw new CustomException($"Das Event '{@event.Id}' existiert bereits.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Check if the current user is already a manager.
                Manager? manager = await DatabaseContext.Managers.FirstOrDefaultAsync(x => x.Email.ToLower() == displayName.ToLower());
                if (manager == null)
                {
                    // Add current user as manager.
                    manager = new Manager
                    {
                        Email = displayName,
                        CreatedBy = displayName,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Create the manager.
                    DatabaseContext.Managers.Add(manager);
                    await DatabaseContext.SaveChangesAsync();
                }

                // Map the event input.
                Event dbEvent = Mapper.Map<Event>(@event, x => x.AfterMap((src, dest) => dest.CreatedBy = displayName));

                // Create the event.
                DatabaseContext.Events.Add(dbEvent);
                await DatabaseContext.SaveChangesAsync();

                // Create default categories.
                List<string> defaultCategories = ["Freunde, Familie, Arbeitskollegen FF Fischbach", "Mitglieder Feuerwehren Stadt Kelkheim", "Fischbacher Vereine", "Kelkheimer Vereine", "Privatgruppen", "Bauhof Stadt Kelkheim"];
                dbEvent.Categories = new List<Category>();
                foreach (string category in defaultCategories)
                {
                    dbEvent.Categories.Add(new Category
                    {
                        Name = category,
                        EventId = dbEvent.Id,
                        SignUpFrom = DateTime.UtcNow,
                        SignUpTo = @event.Date,
                        CreatedBy = displayName,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Create the event manager.
                EventManager eventManager = new EventManager
                {
                    EventId = dbEvent.Id,
                    ManagerId = manager.Id,
                    CreatedBy = displayName,
                    CreatedAt = DateTime.UtcNow
                };

                DatabaseContext.EventManagers.Add(eventManager);

                // Add Categories as well as event manager.
                await DatabaseContext.SaveChangesAsync();

                // Map the database version of the event as return value.
                returnValue = Mapper.Map<EventDetailOutputModel>(dbEvent);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to create event '{id}'.", @event.Id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to create event '{id}'.", @event.Id);
                throw new CustomException("Unerwarteter Fehler beim Erstellen des Events.", ex);
            }
            return returnValue;
        }

        public async Task<List<EventOutputModel>> GetEventsAsync(ClaimsPrincipal user)
        {
            List<EventOutputModel> returnValue = [];
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get group and participant counts.
                List<EventOutputModel> counts = await DatabaseContext.Events
                    .Where(x => x.EventManagers!.Any(x => x.Manager!.Email.ToLower() == displayName.ToLower())) // Filter by user display name.
                    .Select(x => new EventOutputModel                                                           // Select id and counts to join them with the actual data later.
                    {
                        Id = x.Id,
                        TotalGroups = x.Groups!.Count,
                        TotalParticipants = x.Groups!.Sum(y => y.Participants!.Count),
                        CreatedBy = x.CreatedBy // This is only because the output model does not allow empty created by fields. If we don't want this we need a new query model specifically for this case.
                    })
                    .ToListAsync();

                // Get events.
                returnValue = Mapper.Map<List<EventOutputModel>>(
                        await DatabaseContext.Events
                        .Where(x => x.EventManagers!.Any(x => x.Manager!.Email.ToLower() == displayName.ToLower()))
                        .OrderByDescending(x => x.CreatedAt)
                        .ToListAsync());

                // Join the events with their counts.
                foreach (EventOutputModel item in returnValue)
                {
                    // Get corresponding count.
                    EventOutputModel? count = counts.FirstOrDefault(x => x.Id == item.Id);

                    if (count != null)
                    {
                        item.TotalGroups = count.TotalGroups;
                        item.TotalParticipants = count.TotalParticipants;
                    }
                }
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to get the events.");
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to get the events.");
                throw new CustomException("Unerwarteter Fehler beim Lesen der Events.", ex);
            }
            return returnValue;
        }

        public async Task<EventDetailOutputModel> GetEventAsync(ClaimsPrincipal user, string id)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events
                                        .Include(x => x.Groups!)
                                            .ThenInclude(x => x.Participants)   // Include the participants to calculate the count.
                                        .Include(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                        .Include(x => x.Categories)
                                        .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower());

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

                // Success. Map the response.
                returnValue = Mapper.Map<EventDetailOutputModel>(dbEvent);

                // Get the total amounts.
                int totalParticipants = 0;
                for (int i = 0; i < returnValue.Groups.Count; i++)
                {
                    // Get participant amount of this group.
                    int? groupParticipants = dbEvent.Groups?[i]?.Participants?.Count;
                    if (!groupParticipants.HasValue) groupParticipants = 0;

                    // Add to total for event.
                    totalParticipants += (int)groupParticipants;

                    returnValue.Groups[i].TotalParticipants = (int)groupParticipants;
                }

                // Merge with counts.
                returnValue.TotalGroups = returnValue.Groups.Count;
                returnValue.TotalParticipants = totalParticipants;
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to get event '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to get event '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Lesen des Events.", ex);
            }
            return returnValue;
        }

        public async Task<EventDetailOutputModel> UpdateEventAsync(ClaimsPrincipal user, string id, EventUpdateModel @event)
        {
            EventDetailOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events
                                        .Include(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower());

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

                // Update the db event value by mapping the update event into it.
                Mapper.Map(@event, dbEvent);

                // Update trackables.
                dbEvent.UpdatedBy = displayName;
                dbEvent.UpdatedAt = DateTime.UtcNow;

                DatabaseContext.Events.Update(dbEvent);
                await DatabaseContext.SaveChangesAsync();

                // Return the updated event.
                returnValue = await GetEventAsync(user, id);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to update event '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to update event '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Aktualisieren des Events.", ex);
            }
            return returnValue;
        }

        public async Task DeleteEventAsync(ClaimsPrincipal user, string id)
        {
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events
                                        .Include(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower());

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

                // Remove the event, resulting in a cascade of all groups and participants as well as event managers.
                DatabaseContext.Events.Remove(dbEvent);
                await DatabaseContext.SaveChangesAsync();
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to delete event '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to delete event '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Löschen des Events.", ex);
            }
        }

        public async Task<string> GetSignUpFormAsync(string id)
        {
            string returnValue;
            try
            {
                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events
                    .Include(x => x.Categories!)
                    .FirstOrDefaultAsync(x => x.Id.ToLower() == id!.ToLower());

                // Check db response.
                if (dbEvent == null)
                {
                    // Nothing found.
                    throw new CustomException("Das Event konnte nicht gefunden werden.", statusCode: StatusCodes.Status404NotFound);
                }

                returnValue = string.Empty;

                // Get the file contents line by line.
                using var fileStream = File.OpenRead("signup-form.html");
                using var streamReader = new StreamReader(fileStream, Encoding.UTF8, true);
                string? line;
                while ((line = streamReader.ReadLine()) != null)
                {
                    // Check if line contains one of the flags.
                    if (line.Contains("%OPTIONFLAG%"))
                    {
                        DateTime currentTime = DateTime.UtcNow;

                        // Insert the category options here.
                        foreach (Category category in dbEvent.Categories!.OrderBy(x => x.SignUpFrom))
                        {
                            string dateInformation = string.Empty;
                            if (category.SignUpFrom != null && category.SignUpFrom > currentTime)
                            {
                                // Too early.
                                dateInformation = $"ab {TimeZoneInfo.ConvertTimeFromUtc((DateTime)category.SignUpFrom, TimeZoneInfo.Local):dd.MM.yyyy HH:mm}";
                            }
                            else if (category.SignUpTo != null && category.SignUpTo < currentTime)
                            {
                                // Too late.
                                dateInformation = $"bis {TimeZoneInfo.ConvertTimeFromUtc((DateTime)category.SignUpTo, TimeZoneInfo.Local):dd.MM.yyyy HH:mm}";
                            }

                            // Build the option element.
                            returnValue += $"<option value=\"{category.Id}\"";
                            if (!string.IsNullOrEmpty(dateInformation)) returnValue += " disabled";
                            returnValue += $">{category.Name}";
                            if (!string.IsNullOrEmpty(dateInformation)) returnValue += $" ({dateInformation})";
                            returnValue += "</option>" + Environment.NewLine;
                        }
                    }
                    else if (line.Contains("%EVENTIDFLAG%"))
                    {
                        returnValue += $"const EVENT_ID = '{id}';{Environment.NewLine}";
                    }
                    else if (line.Contains("%DESCRIPTIONFLAG%"))
                    {
                        returnValue += $"<span>{dbEvent.Description}</span>";
                    }
                    else
                    {
                        returnValue += line + Environment.NewLine;
                    }
                }
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to get sign up form for event '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to get sign up form for event '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Lesen des Event Sign Up Formulars.", ex);
            }
            return returnValue;
        }
    }
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
}
