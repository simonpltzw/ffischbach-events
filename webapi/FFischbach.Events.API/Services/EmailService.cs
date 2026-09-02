using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace FFischbach.Events.API.Services
{
    public class EmailService(IConfiguration configuration) : IEmailService
    {
        private IConfiguration Configuration { get; } = configuration;

        public async Task SendRegistrationMailAsync(GroupCreateModel group, Event @event)
        {
            // Create email message with standard sender and receiver information.
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress("Freiwillige Feuerwehr Fischbach Events", Configuration["Email:FromAddress"])); // Send from a configured mail address.
            message.To.Add(new MailboxAddress("", group.Contact!.Email));                                                       // Send to the group contact mail.
            string[]? ccAddresses = Configuration.GetSection("Email:CcAddresses").Get<string[]>();
            ccAddresses?.ToList().ForEach(cc => message.Cc.Add(new MailboxAddress("", cc)));                                    // Add cc mail addresses.
            message.ReplyTo.Add(new MailboxAddress("", Configuration["Email:ReplyToAddress"]));                                 // Make receivers reply to a configured mail address.
            message.Subject = $"Gruppenanmeldung {@event.Id} eingegangen";                                                      // Set subject.

            // Join participants with contact to gain a complete participants list.
            List<ParticipantGroupCreateModel> allParticipants = [group.Contact, .. group.Participants!];

            // Create table rows for each participant.
            string tableRows = "";
            foreach (ParticipantGroupCreateModel participant in allParticipants)
            {
                tableRows += $@"
<tr>
    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{participant.FirstName} {participant.LastName}</td>
    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{participant.BirthDate:dd.MM.yyyy}</td>
</tr>";
            }

            // Create the participants table.
            string participantTableHtml = $@"
<table style='width: 100%; border-collapse: collapse; font-size: 15px;'>
    <thead>
        <tr style='background: #f0f0f0;'>
            <th align='left' style='padding: 8px;'>Name</th>
            <th align='left' style='padding: 8px;'>Geburtsdatum</th>
        </tr>
    </thead>
    <tbody>
        {tableRows}
    </tbody>
</table>
";

            // Replace the placeholders in the event mail contents.
            string emailContent = @event.RegistrationEmailContent!
                .Replace("[[ContactFirstName]]", group.Contact.FirstName)
                .Replace("[[GroupName]]", group.Name)
                .Replace("[[ParticipantsTable]]", participantTableHtml);

            // Create the email html body and insert the contents.
            string html = $@"
<!DOCTYPE html>
<html lang='de'>
<body style='font-family: Arial, sans-serif; background: #fafafa; padding: 20px;'>
    <div style='max-width: 600px; margin: auto; background: white; border-radius: 6px; padding: 20px; border: 1px solid #e6e6e6;'>
        {emailContent}
    </div>
</body>
</html>";

            // Assign the html content as mail body.
            message.Body = new TextPart("html")
            {
                Text = html
            };

            // Send the mail to the contact.
            await SendMailAsync(message);
        }

        public async Task SendApprovalMailAsync(GroupApprovalModel group, Event @event)
        {
            // Create email message with standard sender and receiver information.
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress("Freiwillige Feuerwehr Fischbach RAUP", Configuration["Email:FromAddress"]));   // Send from a configured mail address.
            message.To.Add(new MailboxAddress("", group.Contact!.Email));                                                       // Send to the group contact mail.
            string[]? ccAddresses = Configuration.GetSection("Email:CcAddresses").Get<string[]>();
            ccAddresses?.ToList().ForEach(cc => message.Cc.Add(new MailboxAddress("", cc)));                                    // Add cc mail addresses.
            message.ReplyTo.Add(new MailboxAddress("", Configuration["Email:ReplyToAddress"]));                                 // Make receivers reply to a configured mail address.
            message.Subject = $"Gruppenanmeldung {@event.Id} genehmigt";                                                        // Set subject.

            // Join participants with contact to gain a complete participants list.
            List<ParticipantGroupApprovalModel> allParticipants = [group.Contact, .. group.Participants!];

            // Create table rows for each participant.
            string tableRows = "";
            foreach (ParticipantGroupApprovalModel participant in allParticipants)
            {
                tableRows += $@"
<tr>
    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{participant.FirstName} {participant.LastName}</td>
    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{participant.BirthDate:dd.MM.yyyy}</td>
    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>
        {(participant.VIP == true ? "<span style='color:#daa520; font-weight:bold;'>VIP</span>" : "—")}
    </td>
</tr>";
            }

            // Create the participants table.
            string participantTableHtml = $@"
<table style='width: 100%; border-collapse: collapse; font-size: 15px;'>
    <thead>
        <tr style='background: #f0f0f0;'>
            <th align='left' style='padding: 8px;'>Name</th>
            <th align='left' style='padding: 8px;'>Geburtsdatum</th>
            <th align='left' style='padding: 8px;'>VIP</th>
        </tr>
    </thead>
    <tbody>
        {tableRows}
    </tbody>
</table>
";

            // Replace the placeholders in the event mail contents.
            string emailContent = @event.ApprovalEmailContent!
                .Replace("[[ContactFirstName]]", group.Contact.FirstName)
                .Replace("[[GroupName]]", group.Name)
                .Replace("[[ParticipantsTable]]", participantTableHtml);

            // Create the email html body and insert the contents.
            string html = $@"
<!DOCTYPE html>
<html lang='de'>
<body style='font-family: Arial, sans-serif; background: #fafafa; padding: 20px;'>
    <div style='max-width: 600px; margin: auto; background: white; border-radius: 6px; padding: 20px; border: 1px solid #e6e6e6;'>
        {emailContent}
    </div>
</body>
</html>";

            // Assign the html content as mail body.
            message.Body = new TextPart("html")
            {
                Text = html
            };

            // Send the mail to the contact.
            await SendMailAsync(message);
        }

        /// <summary>
        /// Sends a mail to a pre-configured smtp server.
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        private async Task SendMailAsync(MimeMessage message)
        {
            // Initialize the mail kit smtp client. (opens tcp port etc.)
            using SmtpClient client = new SmtpClient();

            try
            {
                // Connect and authorized at the smtp server.
                await client.ConnectAsync(Configuration["Email:Host"], Configuration.GetValue<int>("Email:Port"), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(Configuration["Email:Login"], Configuration["Email:Password"]);

                // Send the prepared mail.
                await client.SendAsync(message);
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                // Disonnect the smtp client. (closes tcp port etc.)
                await client.DisconnectAsync(true);
            }
        }
    }
}
