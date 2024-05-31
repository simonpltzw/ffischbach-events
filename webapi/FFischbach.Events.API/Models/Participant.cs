namespace FFischbach.Events.API.Models
{
    public class Participant
    {
        public int Id { get; set; }
        public required byte[] EncryptedData { get;set; }
        public bool IsContact { get; set; }
        public bool? VIP { get; set; }
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
