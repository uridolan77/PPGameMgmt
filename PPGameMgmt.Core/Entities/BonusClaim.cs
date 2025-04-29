using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("bonus_claims")]
    public class BonusClaim
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("player_id")]
        public string PlayerId { get; set; }
        
        [Column("bonus_id")]
        public string BonusId { get; set; }
        
        [Column("claim_date")]
        public DateTime ClaimDate { get; set; }
        
        [Column("expiration_date")]
        public DateTime ExpirationDate { get; set; }
        
        [Column("bonus_value")]
        public decimal BonusValue { get; set; }
        
        [Column("deposit_amount")]
        public decimal DepositAmount { get; set; }
        
        [Column("wagering_requirement")]
        public decimal WageringRequirement { get; set; }
        
        [Column("wagering_progress")]
        public decimal WageringProgress { get; set; }
        
        [Column("status")]
        public BonusClaimStatus Status { get; set; }
        
        [Column("conversion_trigger")]
        public string ConversionTrigger { get; set; }
        
        // Navigation properties
        public Player Player { get; set; }
        public Bonus Bonus { get; set; }
        
        // Helper methods
        public decimal GetRemainingWagering() => 
            WageringRequirement > WageringProgress ? 
            WageringRequirement - WageringProgress : 0;
        
        public bool IsComplete() => Status == BonusClaimStatus.Completed;
    }
    
    public enum BonusClaimStatus
    {
        Active,
        Completed,
        Expired,
        Cancelled
    }
}