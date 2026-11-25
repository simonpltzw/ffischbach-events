using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Services.Interfaces;
using System.Collections.Concurrent;

namespace FFischbach.Events.API.Tests.Infrastructure
{
    /// <summary>
    /// Replaces the SMTP mail service: nothing is sent, every mail is only recorded.
    /// </summary>
    public class FakeEmailService : IEmailService
    {
        private readonly ConcurrentQueue<(GroupCreateModel Group, Event Event)> _registrationMails = new();
        private readonly ConcurrentQueue<(GroupApprovalModel Group, Event Event)> _approvalMails = new();

        public IReadOnlyList<(GroupCreateModel Group, Event Event)> RegistrationMails => [.. _registrationMails];

        public IReadOnlyList<(GroupApprovalModel Group, Event Event)> ApprovalMails => [.. _approvalMails];

        public Task SendRegistrationMailAsync(GroupCreateModel group, Event @event)
        {
            _registrationMails.Enqueue((group, @event));
            return Task.CompletedTask;
        }

        public Task SendApprovalMailAsync(GroupApprovalModel group, Event @event)
        {
            _approvalMails.Enqueue((group, @event));
            return Task.CompletedTask;
        }

        public void Clear()
        {
            _registrationMails.Clear();
            _approvalMails.Clear();
        }
    }
}
