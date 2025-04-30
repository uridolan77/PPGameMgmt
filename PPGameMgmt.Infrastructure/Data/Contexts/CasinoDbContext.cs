using System;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Entities.Recommendations;

namespace PPGameMgmt.Infrastructure.Data.Contexts
{
    public class CasinoDbContext : DbContext
    {
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions();

        public CasinoDbContext(DbContextOptions<CasinoDbContext> options) : base(options)
        {
        }

        // Use only the Bonus entity from the Bonuses namespace - do not expose the legacy entity types
        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<PlayerFeatures> PlayerFeatures { get; set; }
        public DbSet<OutboxMessage> OutboxMessages { get; set; }
        public DbSet<Core.Entities.Bonuses.BonusClaim> BonusClaims { get; set; }
        public DbSet<Core.Entities.Bonuses.Bonus> Bonuses { get; set; }
        public DbSet<Core.Entities.Recommendations.GameRecommendation> GameRecommendations { get; set; }
        public DbSet<Core.Entities.Recommendations.BonusRecommendation> BonusRecommendations { get; set; }
        public DbSet<MigrationHistory> MigrationHistories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Player configuration
            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.Language).HasMaxLength(10);
                entity.Property(e => e.TotalDeposits).HasPrecision(18, 2);
                entity.Property(e => e.TotalWithdrawals).HasPrecision(18, 2);
                entity.Property(e => e.AverageDepositAmount).HasPrecision(18, 2);

                // Configure enum conversion for MySQL ENUM type
                entity.Property(e => e.Segment)
                    .HasColumnName("segment")
                    .HasConversion(
                        v => v.ToString(),
                        v => (PlayerSegment)Enum.Parse(typeof(PlayerSegment), v)
                    );

                // Relationships
                entity.HasMany(p => p.GameSessions)
                      .WithOne(gs => gs.Player)
                      .HasForeignKey(gs => gs.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.BonusClaims)
                      .WithOne(bc => bc.Player)
                      .HasForeignKey(bc => bc.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Game configuration
            modelBuilder.Entity<Game>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Provider).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.RTP).HasPrecision(5, 2);
                entity.Property(e => e.MinimumBet).HasPrecision(18, 2);
                entity.Property(e => e.MaximumBet).HasPrecision(18, 2);
                entity.Property(e => e.ThumbnailUrl).HasMaxLength(200);
                entity.Property(e => e.GameUrl).HasMaxLength(200);

                // Configure enum conversions for MySQL ENUM types
                entity.Property(e => e.Type)
                    .HasColumnName("type")
                    .HasConversion(
                        v => v.ToString(),
                        v => (GameType)Enum.Parse(typeof(GameType), v)
                    );

                entity.Property(e => e.Category)
                    .HasColumnName("category")
                    .HasConversion(
                        v => v.ToString(),
                        v => (GameCategory)Enum.Parse(typeof(GameCategory), v)
                    );
            });

            // PlayerFeatures configuration
            modelBuilder.Entity<PlayerFeatures>(entity =>
            {
                entity.HasKey(e => e.PlayerId);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.AverageBetSize).HasPrecision(18, 2);
                entity.Property(e => e.AverageSessionLengthMinutes);
                entity.Property(e => e.PreferredDevice).HasMaxLength(20);
                entity.Property(e => e.TotalDepositsLast30Days).HasPrecision(18, 2);
                entity.Property(e => e.TotalWithdrawalsLast30Days).HasPrecision(18, 2);
                entity.Property(e => e.AverageDepositAmount).HasPrecision(18, 2);
                entity.Property(e => e.PlayerLifetimeValue).HasPrecision(18, 2);
                entity.Property(e => e.LifetimeValue).HasPrecision(18, 2);
                entity.Property(e => e.MonthlyAverageDeposit).HasPrecision(18, 2);
                entity.Property(e => e.TypicalDepositAmount).HasPrecision(18, 2);

                // Configure enum conversions for MySQL ENUM types
                entity.Property(e => e.FavoriteGameType)
                    .HasColumnName("favorite_game_type")
                    .HasConversion(
                        v => v.HasValue ? v.ToString() : null,
                        v => string.IsNullOrEmpty(v) ? null : (GameType?)Enum.Parse(typeof(GameType), v)
                    );

                // Handle BonusType enum conversion
                entity.Property(e => e.PreferredBonusType)
                    .HasColumnName("preferred_bonus_type")
                    .HasConversion(
                        v => v.HasValue ? v.ToString() : null,
                        v => string.IsNullOrEmpty(v) ? null :
                            (Core.Entities.Bonuses.BonusType?)Enum.Parse(typeof(Core.Entities.Bonuses.BonusType), v)
                    );

                entity.Property(e => e.CurrentSegment)
                    .HasColumnName("current_segment")
                    .HasConversion(
                        v => v.ToString(),
                        v => (PlayerSegment)Enum.Parse(typeof(PlayerSegment), v)
                    );

                // Store arrays as JSON with value comparers
                entity.Property(e => e.TopPlayedGameIds)
                    .HasColumnName("top_played_game_ids")
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, _jsonOptions),
                        v => JsonSerializer.Deserialize<string[]>(v, _jsonOptions)
                    ).Metadata.SetValueComparer(
                        new ValueComparer<string[]>(
                            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                            c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())) : 0,
                            c => c != null ? c.ToArray() : null
                        )
                    );

                entity.Property(e => e.PreferredTimeSlots)
                    .HasColumnName("preferred_time_slots")
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, _jsonOptions),
                        v => JsonSerializer.Deserialize<string[]>(v, _jsonOptions)
                    ).Metadata.SetValueComparer(
                        new ValueComparer<string[]>(
                            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                            c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())) : 0,
                            c => c != null ? c.ToArray() : null
                        )
                    );
            });

            // Configure Bonus entity (from Bonuses namespace)
            modelBuilder.Entity<Core.Entities.Bonuses.Bonus>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.ToTable("bonuses"); // Specify table name explicitly

                // Configure properties
                entity.Property(b => b.Id).HasColumnName("id");
                entity.Property(b => b.Name).HasColumnName("name").IsRequired();
                entity.Property(b => b.Description).HasColumnName("description").IsRequired();
                entity.Property(b => b.Value).HasColumnName("value").HasPrecision(18, 2);
                entity.Property(b => b.WageringRequirement).HasColumnName("wagering_requirement").HasPrecision(18, 2);
                entity.Property(b => b.ValidFrom).HasColumnName("valid_from");
                entity.Property(b => b.ValidTo).HasColumnName("valid_to");
                entity.Property(b => b.IsActive).HasColumnName("is_active");
                entity.Property(b => b.TermsAndConditions).HasColumnName("terms_and_conditions");
                entity.Property(b => b.MaxConversion).HasColumnName("max_conversion").HasPrecision(18, 2);
                entity.Property(b => b.MinDeposit).HasColumnName("min_deposit").HasPrecision(18, 2);

                // Configure enum conversion for BonusType
                entity.Property(b => b.Type)
                    .HasColumnName("bonus_type")
                    .HasConversion(
                        v => v.ToString(),
                        v => (Core.Entities.Bonuses.BonusType)Enum.Parse(typeof(Core.Entities.Bonuses.BonusType), v)
                    );

                // Configure relationship with BonusClaim
                entity.HasMany(b => b.BonusClaims)
                      .WithOne(bc => bc.Bonus)
                      .HasForeignKey(bc => bc.BonusId);
            });

            // Configure BonusClaim entity
            modelBuilder.Entity<Core.Entities.Bonuses.BonusClaim>(entity =>
            {
                entity.HasKey(bc => bc.Id);
                entity.ToTable("bonus_claims"); // Specify table name explicitly

                // Configure properties
                entity.Property(bc => bc.Id).HasColumnName("id");
                entity.Property(bc => bc.PlayerId).HasColumnName("player_id");
                entity.Property(bc => bc.BonusId).HasColumnName("bonus_id");
                entity.Property(bc => bc.ClaimDate).HasColumnName("claim_date");
                entity.Property(bc => bc.ExpiryDate).HasColumnName("expiry_date");
                entity.Property(bc => bc.WageringRequirement).HasColumnName("wagering_requirement").HasPrecision(18, 2);
                entity.Property(bc => bc.WageringProgress).HasColumnName("wagering_progress").HasPrecision(18, 2);
                entity.Property(bc => bc.AmountConverted).HasColumnName("amount_converted").HasPrecision(18, 2);
                entity.Property(bc => bc.ConversionDate).HasColumnName("conversion_date");
                entity.Property(bc => bc.CompletionDate).HasColumnName("completion_date");

                // Configure enum conversion for BonusClaimStatus
                entity.Property(bc => bc.Status)
                    .HasColumnName("status")
                    .HasConversion(
                        v => v.ToString(),
                        v => (Core.Entities.Bonuses.BonusClaimStatus)Enum.Parse(typeof(Core.Entities.Bonuses.BonusClaimStatus), v)
                    );

                // Configure relationships
                entity.HasOne(bc => bc.Player)
                      .WithMany(p => p.BonusClaims)
                      .HasForeignKey(bc => bc.PlayerId);

                entity.HasOne(bc => bc.Bonus)
                      .WithMany(b => b.BonusClaims)
                      .HasForeignKey(bc => bc.BonusId);
            });

            // Configure BonusRecommendation entity
            modelBuilder.Entity<Core.Entities.Recommendations.BonusRecommendation>(entity =>
            {
                entity.HasKey(br => br.Id);
                entity.ToTable("bonus_recommendations"); // Specify table name explicitly

                // Configure properties
                entity.Property(br => br.Id).HasColumnName("id");
                entity.Property(br => br.PlayerId).HasColumnName("player_id");
                entity.Property(br => br.BonusId).HasColumnName("bonus_id");
                entity.Property(br => br.Score).HasColumnName("score");
                entity.Property(br => br.RecommendationDate).HasColumnName("recommendation_date");
                entity.Property(br => br.Reason).HasColumnName("reason");
                entity.Property(br => br.IsShown).HasColumnName("is_shown");
                entity.Property(br => br.IsClaimed).HasColumnName("is_claimed");
                entity.Property(br => br.ShownDate).HasColumnName("shown_date");
                entity.Property(br => br.ClaimedDate).HasColumnName("claimed_date");

                // Configure relationships
                entity.HasOne<Player>()
                      .WithMany()
                      .HasForeignKey(br => br.PlayerId);

                // Use string-based foreign key configuration instead of navigation property
                entity.HasOne<Core.Entities.Bonuses.Bonus>()
                      .WithMany()
                      .HasForeignKey(br => br.BonusId);
            });

            // Configure MigrationHistory entity
            modelBuilder.Entity<MigrationHistory>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.ToTable("MigrationHistory");

                entity.Property(m => m.Id).HasColumnName("Id").IsRequired();
                entity.Property(m => m.Description).HasColumnName("Description").IsRequired();
                entity.Property(m => m.AppliedAt).HasColumnName("AppliedAt");
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.ToTable("users");
                
                entity.Property(u => u.Id).HasColumnName("id").IsRequired();
                entity.Property(u => u.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
                entity.Property(u => u.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                entity.Property(u => u.PasswordSalt).HasColumnName("password_salt").HasMaxLength(255).IsRequired();
                entity.Property(u => u.FirstName).HasColumnName("first_name").HasMaxLength(50);
                entity.Property(u => u.LastName).HasColumnName("last_name").HasMaxLength(50);
                entity.Property(u => u.IsActive).HasColumnName("is_active").IsRequired();
                entity.Property(u => u.IsEmailVerified).HasColumnName("is_email_verified").IsRequired();
                entity.Property(u => u.VerificationToken).HasColumnName("verification_token").HasMaxLength(100);
                entity.Property(u => u.ResetPasswordToken).HasColumnName("reset_password_token").HasMaxLength(100);
                entity.Property(u => u.ResetPasswordExpires).HasColumnName("reset_password_expires");
                entity.Property(u => u.LastLoginDate).HasColumnName("last_login_date");
                entity.Property(u => u.CreatedAt).HasColumnName("created_at").IsRequired();
                entity.Property(u => u.UpdatedAt).HasColumnName("updated_at").IsRequired();
                entity.Property(u => u.Role).HasColumnName("role").HasMaxLength(20).IsRequired();
                entity.Property(u => u.PlayerId).HasColumnName("player_id");
                
                // Indexes
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();
                
                // Relationships
                entity.HasOne(u => u.Player)
                    .WithMany()
                    .HasForeignKey(u => u.PlayerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            
            // RefreshToken configuration
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);
                entity.ToTable("refresh_tokens");
                
                entity.Property(rt => rt.Id).HasColumnName("id").IsRequired();
                entity.Property(rt => rt.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(rt => rt.Token).HasColumnName("token").HasMaxLength(255).IsRequired();
                entity.Property(rt => rt.Expires).HasColumnName("expires").IsRequired();
                entity.Property(rt => rt.CreatedAt).HasColumnName("created_at").IsRequired();
                entity.Property(rt => rt.Revoked).HasColumnName("revoked").IsRequired();
                entity.Property(rt => rt.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(255);
                
                // Indexes
                entity.HasIndex(rt => rt.Token);
                entity.HasIndex(rt => rt.UserId);
                
                // Relationships
                entity.HasOne(rt => rt.User)
                    .WithMany()
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}