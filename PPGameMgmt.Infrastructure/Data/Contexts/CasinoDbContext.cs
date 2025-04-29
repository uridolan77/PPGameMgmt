using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Infrastructure.Data.Contexts
{
    public class CasinoDbContext : DbContext
    {
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions();

        public CasinoDbContext(DbContextOptions<CasinoDbContext> options) : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Bonus> Bonuses { get; set; }
        public DbSet<GameSession> GameSessions { get; set; }
        public DbSet<BonusClaim> BonusClaims { get; set; }
        public DbSet<PlayerFeatures> PlayerFeatures { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }
        public DbSet<OutboxMessage> OutboxMessages { get; set; }

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

                // Relationships
                entity.HasMany(g => g.GameSessions)
                      .WithOne(gs => gs.Game)
                      .HasForeignKey(gs => gs.GameId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Bonus configuration
            modelBuilder.Entity<Bonus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.PercentageMatch).HasPrecision(5, 2);
                entity.Property(e => e.MinimumDeposit).HasPrecision(18, 2);

                // Configure enum conversions for MySQL ENUM types
                entity.Property(e => e.Type)
                    .HasColumnName("type")
                    .HasConversion(
                        v => v.ToString(),
                        v => (BonusType)Enum.Parse(typeof(BonusType), v)
                    );

                entity.Property(e => e.TargetSegment)
                    .HasColumnName("target_segment")
                    .HasConversion(
                        v => v.ToString(),
                        v => (PlayerSegment)Enum.Parse(typeof(PlayerSegment), v)
                    );

                // Store arrays as JSON with value comparers
                entity.Property(e => e.ApplicableGameIds)
                    .HasColumnName("applicable_game_ids")
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

                entity.Property(e => e.TargetSegments)
                    .HasColumnName("target_segments")
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, _jsonOptions),
                        v => JsonSerializer.Deserialize<PlayerSegment[]>(v, _jsonOptions)
                    ).Metadata.SetValueComparer(
                        new ValueComparer<PlayerSegment[]>(
                            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                            c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())) : 0,
                            c => c != null ? c.ToArray() : null
                        )
                    );

                // Relationships
                entity.HasMany(b => b.BonusClaims)
                      .WithOne(bc => bc.Bonus)
                      .HasForeignKey(bc => bc.BonusId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // GameSession configuration
            modelBuilder.Entity<GameSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalBets).HasPrecision(18, 2);
                entity.Property(e => e.TotalWins).HasPrecision(18, 2);
                entity.Property(e => e.DeviceType).HasMaxLength(20);
                entity.Property(e => e.BrowserInfo).HasMaxLength(200);
                entity.Property(e => e.DepositAmount).HasPrecision(18, 2);
                entity.Property(e => e.WithdrawalAmount).HasPrecision(18, 2);

                // Relationships already defined in Player and Game entities
            });

            // BonusClaim configuration
            modelBuilder.Entity<BonusClaim>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BonusValue).HasPrecision(18, 2);
                entity.Property(e => e.DepositAmount).HasPrecision(18, 2);
                entity.Property(e => e.WageringProgress).HasPrecision(5, 2);
                entity.Property(e => e.ConversionTrigger).HasMaxLength(50);

                // Configure enum conversion for MySQL ENUM type
                entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .HasConversion(
                        v => v.ToString(),
                        v => (BonusClaimStatus)Enum.Parse(typeof(BonusClaimStatus), v)
                    );

                // Relationships already defined in Player and Bonus entities
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

                entity.Property(e => e.PreferredBonusType)
                    .HasColumnName("preferred_bonus_type")
                    .HasConversion(
                        v => v.HasValue ? v.ToString() : null,
                        v => string.IsNullOrEmpty(v) ? null : (BonusType?)Enum.Parse(typeof(BonusType), v)
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

            // Recommendation configuration
            modelBuilder.Entity<Recommendation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlayerId).IsRequired();

                // Store complex objects as JSON with value comparer
                entity.Property(e => e.RecommendedGames).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<List<GameRecommendation>>(v, _jsonOptions)
                ).Metadata.SetValueComparer(
                    new ValueComparer<List<GameRecommendation>>(
                        (c1, c2) => c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    )
                );

                entity.Property(e => e.RecommendedBonus).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<BonusRecommendation>(v, _jsonOptions)
                );
            });
        }
    }
}