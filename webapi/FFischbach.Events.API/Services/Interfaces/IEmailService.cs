using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IEmailService
    {
        /// <summary>
        /// Sends the registration email to the group's contact person.
        /// </summary>
        /// <param name="group"></param>
        /// <param name="event"></param>
        /// <returns></returns>
        Task SendRegistrationMailAsync(GroupCreateModel group, Event @event);

        /// <summary>
        /// Sends the approval email to the group's contact person.
        /// </summary>
        /// <param name="group"></param>
        /// <param name="event"></param>
        /// <returns></returns>
        Task SendApprovalMailAsync(GroupApprovalModel group, Event @event);
    }
}
