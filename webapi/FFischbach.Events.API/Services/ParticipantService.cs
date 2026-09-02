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
    public class ParticipantService(ILogger<ParticipantService> logger, IMapper mapper, DatabaseContext databaseContext, IUserService userService) : IParticipantService
    {
        private ILogger<ParticipantService> Logger { get; } = logger;
        private IMapper Mapper { get; } = mapper;
        private DatabaseContext DatabaseContext { get; } = databaseContext;
        private IUserService UserService { get; } = userService;

        public async Task<ParticipantOutputModel> CreateParticipantAsync(ClaimsPrincipal user, ParticipantCreateModel participant, bool isContact)
        {
            ParticipantOutputModel returnValue;
            try
            {
                // Get user display name.
                string displayName = UserService.GetEmail(user);

                // Get group from the database.
                Group? dbGroup = await DatabaseContext.Groups
                                        .Include(x => x.Event!)
                                        .ThenInclude(x => x.EventManagers!)
                                            .ThenInclude(x => x.Manager)
                                    .FirstOrDefaultAsync(x => x.Id == participant.GroupId);

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
                else if (dbGroup.Event!.Completed)
                {
                    // Event is already completed.
                    throw new CustomException("Das Event ist bereits abgeschlossen, es können keine Änderungen mehr daran vorgenommen werden.", statusCode: StatusCodes.Status400BadRequest);
                }

                // Check if the contact should be changed.
                if (isContact)
                {
                    // Check if the email is given.
                    if (string.IsNullOrEmpty(participant.Email))
                    {
                        throw new CustomException("Beim Erstellen eines neuen Kontakts muss eine Email mitgegeben werden.", statusCode: StatusCodes.Status400BadRequest);
                    }

                    // Get the current contact.
                    Participant? currentContact = await DatabaseContext.Participants.FirstOrDefaultAsync(x => x.GroupId == participant.GroupId && x.IsContact);

                    if (currentContact != null)
                    {
                        // Update contact state.
                        currentContact.IsContact = false;
                    }
                }

                // Map the input.
                Participant dbParticipant = Mapper.Map<Participant>(participant!, x => x.Items["PublicKey"] = dbGroup.Event.PublicKey);
                dbParticipant.GroupId = dbGroup.Id;
                dbParticipant.IsContact = isContact;
                dbParticipant.CreatedAt = DateTime.UtcNow;

                // Create the participant.
                DatabaseContext.Participants.Add(dbParticipant);
                await DatabaseContext.SaveChangesAsync();

                // Map the participant.
                returnValue = Mapper.Map<ParticipantOutputModel>(dbParticipant);
            }
            catch (CustomException ex)
            {
                Logger.LogWarning(ex, "Failed to add participant to the group '{id}'.", participant.GroupId);
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failed to add participant to the group '{id}'.", participant.GroupId);
                throw new CustomException("Unerwarteter Fehler beim Hinzufügen eines Teilnehmers.", ex);
            }
            return returnValue;
        }
    }
}
