using System.Runtime.Serialization;

namespace FFischbach.Events.API.Models.Enums
{
    public enum GroupCategory
    {
        [EnumMember(Value = "Sonstiges")]
        Sonstiges = 0,

        [EnumMember(Value = "Freunde, Familie, Arbeitskollegen FF Fischbach")]
        Fischbach_Feuerwehr_Freunde_Familie_Arbeitskollegen = 100,

        [EnumMember(Value = "Mitglieder Feuerwehren Stadt Kelkheim")]
        Kelkheim_Feuerwehren = 200,
        
        [EnumMember(Value = "Fischbacher Vereine")]
        Fischbach_Vereine = 300,
        
        [EnumMember(Value = "Kelkheimer Vereine")]
        Kelkheim_Vereine = 400,
        
        [EnumMember(Value = "Privatgruppen")]
        Privatgruppen = 500,

        [EnumMember(Value = "Bauhof Stadt Kelkheim")]
        Kelkheim_Bauhof = 600
    }
}
