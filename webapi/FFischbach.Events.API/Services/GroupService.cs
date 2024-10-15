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
    public class GroupService(ILogger<GroupService> logger, IMapper mapper, DatabaseContext databaseContext, IUserService userService) : IGroupService
    {
        private ILogger<GroupService> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;

        public async Task CreateGroupAsync(GroupCreateModel group)
        {
            try
            {
                // Get event from the database.
                Event? dbEvent = await DatabaseContext.Events.Include(x => x.Categories).FirstOrDefaultAsync(x => x.Id.ToLower() == group.EventId!.ToLower());

                if (dbEvent == null)
                {
                    // Nothing found.
                    throw new CustomException("Das Event konnte nicht gefunden werden.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Check the given category id.
                Category? category = dbEvent.Categories?.FirstOrDefault(x => x.Id == group.CategoryId);
                if (category == null)
                {
                    // Category could not be found.
                    throw new CustomException("Die angegebene Kategorie konnte nicht gefunden werden.", detail: $"CategoryId: '{group.CategoryId}'", statusCode: StatusCodes.Status400BadRequest);
                }
                else
                {
                    // Check if the category sign up is valid for the current date.
                    DateTime from = category.SignUpFrom ?? DateTime.MinValue;
                    DateTime to = category.SignUpTo ?? DateTime.MaxValue;
                    DateTime current = DateTime.UtcNow;

                    if (current < from)
                    {
                        // Too early.
                        throw new CustomException($"Du bist zu früh, die Anmeldung für '{category.Name}' noch nicht möglich.", detail: $"Category '{category.Id}' sign up starts at '{from:dd.MM.yyyy HH:mm}', it is currently '{current:dd.MM.yyyy HH:mm}'. (TZ=Utc)", statusCode: StatusCodes.Status400BadRequest);
                    }
                    else if (current > to)
                    {
                        // Too late.
                        throw new CustomException($"Du bist zu spät, die Anmeldung für '{category.Name}' ist nicht mehr möglich.", detail: $"Category '{category.Id}' sign up ended '{to:dd.MM.yyyy HH:mm}', it is currently '{current:dd.MM.yyyy HH:mm}'. (TZ=Utc)", statusCode: StatusCodes.Status400BadRequest);
                    }
                }

                // Map the group input. Pass the public key since this mapping also encrypts the data.
                Group dbGroup = Mapper.Map<Group>(group, x => x.Items["PublicKey"] = dbEvent.PublicKey);

                // Check if the group already exists.
                if (await DatabaseContext.Groups.AnyAsync(x => x.HashedName == dbGroup.HashedName && x.EventId.ToLower() == group.EventId!.ToLower()))
                {
                    // Group already exists.
                    throw new CustomException("Dieser Gruppenname ist bereits vergeben.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Create the group.
                DatabaseContext.Groups.Add(dbGroup);
                await DatabaseContext.SaveChangesAsync();
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to create group '{group}' for event '{id}'.", group.Name, group.EventId);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to create group '{group}' for event '{id}'.", group.Name, group.EventId);
                throw new CustomException("Unerwarteter Fehler beim Erstellen der Gruppe.", ex);
            }
        }

        public async Task<GroupDetailOutputModel> GetGroupAsync(ClaimsPrincipal user, int id)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get group from the database.
                Group? dbGroup = (await DatabaseContext.Groups
                                        .Include(x => x.Participants!)
                                        .Include(x => x.Event!)
                                            .ThenInclude(x => x.EventManagers!)
                                                .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id == id));

                // Check db response.
                if (dbGroup == null)
                {
                    // Nothing found.
                    throw new CustomException("Die Gruppe konnte nicht gefunden werden.", statusCode: StatusCodes.Status404NotFound);
                }
                else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für Gruppen dieses Events. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Success. Map the response.
                returnValue = Mapper.Map<Models.OutputModels.GroupDetailOutputModel>(dbGroup);
                returnValue.TotalParticipants = dbGroup.Participants?.Count ?? 0;
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to get the group '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to get the group '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Lesen der Gruppe.", ex);
            }
            return returnValue;
        }

        public async Task<GroupDetailOutputModel> UpdateGroupAsync(ClaimsPrincipal user, int id, GroupUpdateModel group)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get group from the database.
                Group? dbGroup = await DatabaseContext.Groups
                                        .Include(x => x.Participants!)
                                        .Include(x => x.Event!)
                                            .ThenInclude(x => x.EventManagers!)
                                                .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id == id);

                // Check db response.
                if (dbGroup == null)
                {
                    // Nothing found.
                    throw new CustomException("Die Gruppe konnte nicht gefunden werden.", statusCode: StatusCodes.Status400BadRequest);
                }
                else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für Gruppen dieses Events. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Validate the category.
                if (!await DatabaseContext.Categories.AnyAsync(x => x.Id == group.CategoryId && x.EventId == dbGroup.EventId))
                {
                    // Category does not exist for this event.
                    throw new CustomException("Die angegebene Kategorie existiert für das Event nicht.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Map the input.
                Group inputGroup = Mapper.Map<Group>(group);

                // Create local mapper.
                IMapper updateMapper = new Mapper(new MapperConfiguration(c =>
                {
                    c.CreateMap<Group, Group>()
                        .ForMember(x => x.Id, y => y.Ignore())
                        .ForMember(x => x.EventId, y => y.Ignore())
                        .ForMember(x => x.Event, y => y.Ignore())
                        .ForMember(x => x.CreatedAt, y => y.Ignore())
                        .ForMember(x => x.Participants, y => y.Ignore());

                    c.CreateMap<Participant, Participant>()
                        .ForMember(x => x.Id, y => y.Ignore())
                        .ForMember(x => x.GroupId, y => y.Ignore())
                        .ForMember(x => x.Group, y => y.Ignore())
                        .ForMember(x => x.CreatedAt, y => y.Ignore());
                }));

                // Map the mapper input into the db value.
                updateMapper.Map(inputGroup, dbGroup);

                // Update trackables.
                dbGroup.UpdatedBy = displayName;
                dbGroup.UpdatedAt = DateTime.UtcNow;

                // Map the participants.
                List<int> idsToRemove = [];
                foreach (Participant dbParticipant in dbGroup.Participants!)
                {
                    // Get the corresponding input participant.
                    Participant? inputParticipant = inputGroup.Participants!.FirstOrDefault(x => x.Id == dbParticipant.Id);

                    // Check if the participant can be found in input.
                    if (inputParticipant == null)
                    {
                        // Mark the participant as removed for later.
                        idsToRemove.Add(dbParticipant.Id);
                        continue;
                    }

                    // Update the participant.
                    updateMapper.Map(inputParticipant, dbParticipant);
                }

                // Remove participants.
                foreach (int i in idsToRemove)
                {
                    Participant dbParticipant = dbGroup.Participants.First(x => x.Id == i);
                    dbGroup.Participants.Remove(dbParticipant);
                }

                // Update the group.
                await DatabaseContext.SaveChangesAsync();

                // Return the updated state of the group.
                returnValue = await GetGroupAsync(user, id);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to update group '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to update group '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Aktualisieren der Gruppe.", ex);
            }
            return returnValue;
        }

        public async Task DeleteGroupAsync(ClaimsPrincipal user, int id)
        {
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get group from the database.
                Group? dbGroup = (await DatabaseContext.Groups
                                        .Include(x => x.Event!)
                                            .ThenInclude(x => x.EventManagers!)
                                                .ThenInclude(x => x.Manager)
                                        .FirstOrDefaultAsync(x => x.Id == id));

                // Check db response.
                if (dbGroup == null)
                {
                    // Nothing found.
                    throw new CustomException("Die Gruppe konnte nicht gefunden werden.", statusCode: StatusCodes.Status400BadRequest);
                }
                else if (!dbGroup.Event!.EventManagers!.Any(x => x.Manager!.Email.Equals(displayName, StringComparison.CurrentCultureIgnoreCase)))
                {
                    // Calling user is not an event manager of that group.
                    throw new CustomException("Du hast keine Berechtigungen für Gruppen dieses Events. Lass dich von einem Manager des Events hinzufügen.", statusCode: StatusCodes.Status403Forbidden);
                }

                // Remove the group, resulting in a cascade of all participants.
                DatabaseContext.Groups.Remove(dbGroup);
                await DatabaseContext.SaveChangesAsync();
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to delete group '{id}'.", id);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to delete group '{id}'.", id);
                throw new CustomException("Unerwarteter Fehler beim Löschen der Gruppe.", ex);
            }
        }
    }
#pragma warning restore CA1862 // Use the 'StringComparison' method overloads to perform case-insensitive string comparisons
}
