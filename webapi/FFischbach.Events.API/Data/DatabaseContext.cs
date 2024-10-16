﻿using FFischbach.Events.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FFischbach.Events.API.Data
{
    public class DatabaseContext(DbContextOptions options) : DbContext(options)
    {
        public required DbSet<Category> Categories { get; set; }
        public required DbSet<Event> Events { get; set; }
        public required DbSet<EventManager> EventManagers { get; set; }
        public required DbSet<Manager> Managers { get; set; }
        public required DbSet<Group> Groups { get; set; }
        public required DbSet<Participant> Participants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Event>(c =>
            {
                c.HasKey(x => x.Id);

                c.Property(x => x.Description)
                    .HasMaxLength(1000);

                c.Property(x => x.Id)
                    .HasMaxLength(20);

                c.Property(x => x.Date)
                    .IsRequired();

                c.Property(x => x.Completed)
                    .IsRequired();

                c.Property(x => x.PublicKey)
                    .IsRequired();

                c.Property(x => x.EncryptedPrivateKey)
                    .IsRequired();

                c.Property(x => x.UpdatedBy)
                    .HasMaxLength(255);

                c.Property(x => x.UpdatedAt);

                c.Property(x => x.CreatedBy)
                    .HasMaxLength(100)
                    .IsRequired();

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<EventManager>(c =>
            {
                c.HasKey(x => x.Id);

                c.HasOne(x => x.Event)
                    .WithMany(x => x.EventManagers)
                    .HasForeignKey(x => x.EventId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                c.HasOne(x => x.Manager)
                    .WithMany(x => x.EventManagers)
                    .HasForeignKey(x => x.ManagerId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                c.Property(x => x.CreatedBy)
                    .HasMaxLength(255)
                    .IsRequired();

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<Manager>(c =>
            {
                c.HasKey(x => x.Id);

                c.Property(x => x.Email)
                    .HasMaxLength(100)
                    .IsRequired();

                c.Property(x => x.CreatedBy)
                    .HasMaxLength(255)
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
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                c.HasOne(x => x.Category)
                    .WithMany(x => x.Groups)
                    .HasForeignKey(x => x.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                c.Property(x => x.HashedName)
                    .HasMaxLength(64)
                    .IsRequired();

                c.Property(x => x.EncryptedName)
                    .IsRequired();

                c.Property(x => x.UpdatedBy)
                    .HasMaxLength(255);

                c.Property(x => x.UpdatedAt);

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<Participant>(c =>
            {
                c.HasKey(x => x.Id);

                c.HasOne(x => x.Group)
                    .WithMany(x => x.Participants)
                    .HasForeignKey(x => x.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);

                c.Property(x => x.EncryptedData)
                    .IsRequired();

                c.Property(x => x.VIP);

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<Category>(c =>
            {
                c.HasKey(x => x.Id);

                c.HasOne(x => x.Event)
                    .WithMany(x => x.Categories)
                    .HasForeignKey(x => x.EventId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                c.Property(x => x.Name)
                    .HasMaxLength(255)
                    .IsRequired();

                c.Property(x => x.SignUpFrom);

                c.Property(x => x.SignUpTo);

                c.Property(x => x.UpdatedBy)
                    .HasMaxLength(255);

                c.Property(x => x.UpdatedAt);

                c.Property(x => x.CreatedBy)
                    .HasMaxLength(255)
                    .IsRequired();

                c.Property(x => x.CreatedAt)
                    .IsRequired();
            });
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
