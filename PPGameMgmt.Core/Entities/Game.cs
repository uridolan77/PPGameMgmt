using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("games")]
    public class Game
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("name")]
        public required string Name { get; set; }

        [Column("provider")]
        public required string Provider { get; set; }

        [Column("type")]
        public GameType Type { get; set; }

        [Column("category")]
        public GameCategory Category { get; set; }

        [Column("genre")]
        public required string Genre { get; set; }

        [Column("description")]
        public required string Description { get; set; }

        [Column("is_featured")]
        public bool IsFeatured { get; set; }

        [Column("rtp")]
        public decimal RTP { get; set; }

        [Column("minimum_bet")]
        public decimal MinimumBet { get; set; }

        [Column("maximum_bet")]
        public decimal MaximumBet { get; set; }

        [Column("release_date")]
        public DateTime ReleaseDate { get; set; }

        [Column("thumbnail_url")]
        public required string ThumbnailUrl { get; set; }

        [Column("game_url")]
        public required string GameUrl { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("popularity_score")]
        public int PopularityScore { get; set; }

        [Column("compatible_devices")]
        public string[]? CompatibleDevices { get; set; }

        [Column("features")]
        public string[]? Features { get; set; }

        // Navigation properties
        public ICollection<GameSession> GameSessions { get; set; } = [];
    }

    public enum GameType
    {
        Slot,
        Table,
        LiveDealer,
        Poker,
        Bingo,
        Scratchcard,
        Virtual,
        Other
    }

    public enum GameCategory
    {
        Classic,
        Video,
        Progressive,
        VIP,
        New,
        Popular,
        Seasonal,
        Exclusive
    }
}