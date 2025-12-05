using AutoMapper;
using FFischbach.Events.API.Models;
using FFischbach.Events.API.Models.InputModels;
using FFischbach.Events.API.Models.OutputModels;

namespace FFischbach.Events.API.AutoMapper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Category.
            CreateMap<CategoryCreateModel, Category>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow));

            CreateMap<CategoryUpdateModel, Category>();

            CreateMap<Category, CategoryOutputModel>();

            // Event.
            CreateMap<EventCreateModel, Event>()
                .ForMember(x => x.Completed, o => o.MapFrom(x => false))
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.RegistrationEmailContent, o => o.MapFrom(x => DefaultRegistrationEmailContent))
                .ForMember(x => x.ApprovalEmailContent, o => o.MapFrom(x => DefaultApprovalEmailContent));

            CreateMap<EventUpdateModel, Event>();

            CreateMap<Event, EventDetailOutputModel>();

            CreateMap<Event, EventOutputModel>();

            CreateMap<Event, GroupEventOutputModel>();

            // Group.
            CreateMap<GroupCreateModel, Group>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.HashedName, o => o.MapFrom<GroupHashedNameResolver>())
                .ForMember(x => x.EncryptedName, o => o.MapFrom<GroupEncryptedNameResolver>())
                .ForMember(x => x.Participants, o => o.MapFrom<GroupCreateParticipantsResolver>());

            CreateMap<GroupUpdateModel, Group>()
                .ForMember(x => x.Participants, o => o.MapFrom<GroupUpdateParticipantsResolver>());

            CreateMap<Group, GroupOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)));

            CreateMap<Group, GroupDetailOutputModel>()
                .ForMember(x => x.Contact, o => o.MapFrom(x => x.Participants!.First(y => y.IsContact)))
                .ForMember(x => x.Participants, o => o.MapFrom(x => x.Participants!.Where(y => !y.IsContact).ToList()));

            // Participant.
            CreateMap<ParticipantInputModel, Participant>()
                .ForMember(x => x.CreatedAt, o => o.MapFrom(x => DateTime.UtcNow))
                .ForMember(x => x.EncryptedData, o => o.MapFrom<ParticipantEncryptedDataResolver>()); // Requires "PublicKey" as passed in Items dict.

            CreateMap<ParticipantCreateModel, Participant>()
                .IncludeBase<ParticipantInputModel, Participant>();

            CreateMap<ParticipantGroupCreateModel, Participant>()
                .IncludeBase<ParticipantInputModel, Participant>();

            CreateMap<ParticipantUpdateModel, Participant>();

            CreateMap<Participant, ParticipantOutputModel>();
        }

        private const string DefaultRegistrationEmailContent = @"
<p>Hallo [[ContactFirstName]],</p>

<p>
    die Anmeldung deiner Gruppe <strong>[[GroupName]]</strong> für die RAUP ist bei uns eingegangen.
</p>

<p>
    Sobald die Anmeldung genehmigt wurde erhältst du von uns eine weitere Mail.
</p>

<p>Folgende Teilnehmer wurden angemeldet:</p>

[[ParticipantsTable]]

<p>Solltest du noch Rückfragen haben, antworte gerne auf diese Mail.</p>

<p style='margin-top: 30px;'>
    Viele Grüße<br/>
    <strong>RAUP-Orgateam der Feuerwehr Fischbach</strong>
</p>
";

        private const string DefaultApprovalEmailContent = @"
<p>Hallo [[ContactFirstName]],</p>

<p>
    die Anmeldung deiner Gruppe <strong>[[GroupName]]</strong> für die RAUP wurde genehmigt.
</p>

<p>
    Die Tickets können am <strong>05. Februar</strong> zwischen 
    <strong>18:30 Uhr und 19:30 Uhr</strong> im <strong>Fischbacher Gerätehaus</strong> 
    abgeholt werden.
</p>

<p>Bitte weist eure Freunde nochmal auf folgende Hinweise hin, damit es am Veranstaltungstag zu keinen Problemen kommt:</p>

<ul style='line-height: 1.5;'>
    <li>Einlass wird nur mit einer personalisierten Eintrittskarte gewährt.</li>
    <li>Bei Einlass ist ggf. ein Ausweisdokument vorzulegen.</li>
    <li>Die Eintrittskarte berechtigt nicht verbindlich bzw. nicht zum sofortigen Einlass zur Veranstaltung.</li>
    <li>Am Eingang kann es, je nach Auslastung im Veranstaltungsraum, zu Wartezeiten kommen.</li>
    <li>Stark alkoholisierten Personen wird kein Einlass gewährt.</li>
    <li>Mitgebrachte Getränke müssen am Eingang abgegeben werden.</li>
    <li>Verkauf von Getränken und Speisen nur gegen Wertmarken.</li>
    <li>Wir halten uns an das Gesetz zum Schutz der Jugend in der Öffentlichkeit.</li>
    <li>Wir übernehmen keine Haftung für Garderobe, Sachschäden oder Körperschäden.</li>
</ul>

<h3 style='margin-top: 25px;'>Gruppenübersicht</h3>

<p>Folgende Teilnehmer wurden angemeldet:</p>

[[ParticipantsTable]]

<p>Solltest du noch Rückfragen haben, antworte gerne auf diese Mail.</p>

<p style='margin-top: 30px;'>
    Viele Grüße<br/>
    <strong>RAUP-Orgateam der Feuerwehr Fischbach</strong>
</p>";
    }
}
