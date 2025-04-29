using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("games")]
    public class Game
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("name")]
        public string Name { get; set; }
        
        [Column("provider")]
        public string Provider { get; set; }
        
        [Column("type")]
        public GameType Type { get; set; }
        
        [Column("category")]
        public GameCategory Category { get; set; }
        
        [Column("genre")]
        public string Genre { get; set; }
        
        [Column("description")]
        public string Description { get; set; }
        
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
        public string ThumbnailUrl { get; set; }
        
        [Column("game_url")]
        public string GameUrl { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; }
        
        // Navigation properties
        //[NotMapped]
        //public ICollection<GameSession> GameSessions { get; set; } = new List<GameSession>();
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