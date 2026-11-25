namespace FFischbach.Events.API.Mapping
{
    /// <summary>
    /// Default email contents of a newly created event. Managers can change them per event.
    /// </summary>
    internal static class DefaultEmailContents
    {
        public const string Registration = @"
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

        public const string Approval = @"
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
