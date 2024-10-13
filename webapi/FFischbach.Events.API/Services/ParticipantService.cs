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
    public class ParticipantService(ILogger<ParticipantService> logger, IMapper mapper, DatabaseContext databaseContext, IUserService userService, IGroupService groupService) : IParticipantService
    {
        private ILogger<ParticipantService> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;
        private IGroupService GroupService { get; } = groupService;

        public async Task<GroupDetailOutputModel> AddParticipantAsync(ClaimsPrincipal user, int groupId, ParticipantCreateModel participant, bool isContact)
        {
            GroupDetailOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetDisplayName(user);

                // Get group from the database.
                Group? dbGroup = (await DatabaseContext.Groups
                                        .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == groupId));

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

                // Check if the contact should be changed.
                if (isContact)
                {
                    // Get the current contact.
                    Participant? currentContact = await DatabaseContext.Participants.FirstOrDefaultAsync(x => x.GroupId == groupId && x.IsContact);

                    if (currentContact != null)
                    {
                        // Update contact state.
                        currentContact.IsContact = false;
                    }
                }

                // Map the input.
                Participant dbParticipant = Mapper.Map<Models.Participant>(participant!, opt => opt.Items["PublicKey"] = dbGroup.Event.PublicKey);
                dbParticipant.GroupId = dbGroup.Id;
                dbParticipant.IsContact = isContact;

                // Create the participant.
                DatabaseContext.Participants.Add(dbParticipant);
                await DatabaseContext.SaveChangesAsync();

                // Get the new state of the group.
                returnValue = await GroupService.GetGroupAsync(user, groupId);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to add participant to the group '{id}'.", groupId);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to add participant to the group '{id}'.", groupId);
                throw new CustomException("Unerwarteter Fehler beim Hinzufügen eines Teilnehmers.", ex);
            }
            return returnValue;
        }
    }
}
