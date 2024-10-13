using FFischbach.Events.API.Helpers;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;
using System.Security.Claims;

namespace FFischbach.Events.API.Services.Interfaces
{
    public interface IGroupService
    {
        /// <summary>
        /// Creates the given <paramref name="group"/>
        /// </summary>
        /// <param name="group"></param>
        /// <exception cref="CustomException"></exception>
        Task CreateGroupAsync(GroupCreateModel group);

        /// <summary>
        /// Gets a group by <paramref name="id"/> depending on the permissions of the <paramref name="user"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <exception cref="CustomException"></exception>
        Task<GroupDetailOutputModel> GetGroupAsync(ClaimsPrincipal user, int id);

        /// <summary>
        /// Updates the <paramref name="group"/> by <paramref name="id"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <param name="group"></param>
        /// <exception cref="CustomException"></exception>
        Task<GroupDetailOutputModel> UpdateGroupAsync(ClaimsPrincipal user, int id, GroupUpdateModel group);

        /// <summary>
        /// Deletes a group by <paramref name="id"/>.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="id"></param>
        /// <exception cref="CustomException"></exception>
        Task DeleteGroupAsync(ClaimsPrincipal user, int id);
    }
}