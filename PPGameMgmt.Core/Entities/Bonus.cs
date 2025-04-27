using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class Bonus
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public BonusType Type { get; set; }
        public decimal Amount { get; set; }
        public decimal? PercentageMatch { get; set; } // For deposit match bonuses
        public decimal? MinimumDeposit { get; set; } // For deposit related bonuses
        public int? WageringRequirement { get; set; } // Multiplier for wagering
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsGlobal { get; set; } // Whether the bonus is available to all players
        public string GameId { get; set; } // Specific game this bonus applies to (if any)
        public PlayerSegment TargetSegment { get; set; } // Primary target segment for this bonus
        public string[] ApplicableGameIds { get; set; } // Games this bonus can be used on
        public PlayerSegment[] TargetSegments { get; set; } // Player segments this bonus targets
        
        // Navigation properties
        public ICollection<BonusClaim> BonusClaims { get; set; } = new List<BonusClaim>();
    }

    public enum BonusType
    {
        DepositMatch,
        FreeSpins,
        Cashback,
        NoDeposit,
        Reload,
        LoyaltyPoints,
        ReferralBonus,
        TournamentPrize,
        CustomOffer
    }
}