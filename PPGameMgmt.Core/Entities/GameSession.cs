using System;

namespace PPGameMgmt.Core.Entities
{
    public class GameSession
    {
        public string Id { get; set; }
        public string PlayerId { get; set; }
        public string GameId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? Duration => EndTime.HasValue ? EndTime - StartTime : null;
        public decimal TotalBets { get; set; }
        public decimal TotalWins { get; set; }
        public decimal NetResult => TotalWins - TotalBets;
        public int TotalSpins { get; set; } // For slots
        public int TotalHands { get; set; } // For table games
        public string DeviceType { get; set; } // Mobile, Desktop, Tablet
        public string BrowserInfo { get; set; }
        public string? AppliedBonusId { get; set; } // If a bonus was used
        public decimal DepositAmount { get; set; } // Amount deposited during this session
        public decimal WithdrawalAmount { get; set; } // Amount withdrawn during this session
        public GameCategory GameCategory { get; set; } // Category of the game being played
        
        // Navigation properties
        public Player Player { get; set; }
        public Game Game { get; set; }
    }
}