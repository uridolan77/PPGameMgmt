using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("bonuses")]
    public class Bonus
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("name")]
        public string Name { get; set; }
        
        [Column("description")]
        public string Description { get; set; }
        
        [Column("type")]
        public BonusType Type { get; set; }
        
        [Column("amount")]
        public decimal Amount { get; set; }
        
        [Column("percentage_match")]
        public decimal PercentageMatch { get; set; }
        
        [Column("minimum_deposit")]
        public decimal MinimumDeposit { get; set; }
        
        [Column("wagering_requirement")]
        public int WageringRequirement { get; set; }
        
        [Column("expiration_days")]
        public int ExpirationDays { get; set; }
        
        [Column("start_date")]
        public DateTime StartDate { get; set; }
        
        [Column("end_date")]
        public DateTime? EndDate { get; set; }
        
        [Column("is_active")]
        public bool IsActive { get; set; }
        
        [Column("target_segment")]
        public PlayerSegment TargetSegment { get; set; }
        
        [Column("applicable_game_ids")]
        public string[] ApplicableGameIds { get; set; }
        
        [Column("target_segments")]
        public PlayerSegment[] TargetSegments { get; set; }
        
        // Navigation properties
        public ICollection<BonusClaim> BonusClaims { get; set; } = new List<BonusClaim>();
    }

    public enum BonusType
    {
        Deposit,
        NoDeposit,
        FreeSpins,
        Cashback,
        Loyalty
    }
}