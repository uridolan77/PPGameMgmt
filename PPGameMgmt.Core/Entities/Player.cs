using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class Player
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public string Language { get; set; }
        public DateTime RegistrationDate { get; set; }
        public DateTime LastLoginDate { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalWithdrawals { get; set; }
        public decimal AverageDepositAmount { get; set; } // Added missing property
        public int LoginCount { get; set; }
        public PlayerSegment Segment { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }

        // Navigation properties
        public ICollection<GameSession> GameSessions { get; set; } = new List<GameSession>();
        public ICollection<BonusClaim> BonusClaims { get; set; } = new List<BonusClaim>();
    }

    public enum PlayerSegment
    {
        New,
        Casual,
        Regular,
        VIP,
        Dormant
    }
}
