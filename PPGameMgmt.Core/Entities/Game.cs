using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class Game
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Provider { get; set; }
        public GameType Type { get; set; }
        public GameCategory Category { get; set; }
        public string Genre { get; set; } // Added Genre property
        public string Description { get; set; }
        public bool IsFeatured { get; set; }
        public decimal RTP { get; set; } // Return to Player percentage
        public decimal MinimumBet { get; set; }
        public decimal MaximumBet { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string ThumbnailUrl { get; set; }
        public string GameUrl { get; set; }
        public bool IsActive { get; set; }
        
        // Navigation properties
        public ICollection<GameSession> GameSessions { get; set; } = new List<GameSession>();
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