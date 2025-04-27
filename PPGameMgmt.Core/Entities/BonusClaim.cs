using System;

namespace PPGameMgmt.Core.Entities
{
    public class BonusClaim
    {
        public string Id { get; set; }
        public string PlayerId { get; set; }
        public string BonusId { get; set; }
        public DateTime ClaimDate { get; set; }
        public DateTime ClaimedDate { get; set; } // When the bonus was claimed by the player
        public BonusClaimStatus Status { get; set; }
        public decimal? DepositAmount { get; set; } // If it's a deposit-related bonus
        public DateTime? CompletionDate { get; set; } // When wagering was completed
        public decimal? WageringProgress { get; set; } // % of wagering requirements completed
        public bool IsExpired => ExpiryDate.HasValue && DateTime.UtcNow > ExpiryDate.Value;
        public DateTime? ExpiryDate { get; set; }
        public string? ConversionTrigger { get; set; } // How the bonus was offered (email, popup, etc.)
        public decimal BonusValue { get; set; } // Value of the bonus
        public string BonusType { get; set; } // Type of bonus
        
        // Navigation properties
        public Player Player { get; set; }
        public Bonus Bonus { get; set; }
    }

    public enum BonusClaimStatus
    {
        Claimed,
        Active,
        Completed,
        Failed,
        Expired,
        Cancelled
    }
}