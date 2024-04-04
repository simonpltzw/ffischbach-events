using FFischbach.Events.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FFischbach.Events.API.Data
{
    public class DatabaseContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<Event>? Events { get; }
        public DbSet<Group>? Groups { get; }
        public DbSet<Participant>? Participants { get; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Event>(c =>
            {
                c.HasKey(x => x.Id);

                c.Property(x => x.Name)
                    .HasMaxLength(50)
                    .IsRequired();

                c.Property(x => x.PublicKey)
                    .IsRequired();

                c.Property(x => x.PrivateKeyHash)
                    .HasMaxLength(64)
                    .IsRequired();

                c.Property(x => x.CreatedBy)
                    .IsRequired();

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<Group>(c =>
            {
                c.HasKey(x => x.Id);

                c.HasOne(x => x.Event)
                    .WithMany(x => x.Groups)
                    .HasForeignKey(x => x.EventId)
                    .IsRequired();

                c.Property(x => x.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                c.Property(x => x.Category)
                    .HasMaxLength(50);

                c.Property(x => x.CreatedAt);
            });

            modelBuilder.Entity<Participant>(c =>
            {
                c.HasKey(x => x.Id);

                c.HasOne(x => x.Group)
                    .WithMany(x => x.Participants)
                    .HasForeignKey(x => x.GroupId);

                c.Property(x => x.EncryptedData)
                    .IsRequired();

                c.Property(x => x.VIP);

                c.Property(x => x.CreatedAt);
            });
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
