using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("players")]
    public class Player
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("username")]
        public string Username { get; set; }
        
        [Column("email")]
        public string Email { get; set; }
        
        [Column("country")]
        public string Country { get; set; }
        
        [Column("language")]
        public string Language { get; set; }
        
        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }
        
        [Column("last_login_date")]
        public DateTime LastLoginDate { get; set; }
        
        [Column("total_deposits")]
        public decimal TotalDeposits { get; set; }
        
        [Column("total_withdrawals")]
        public decimal TotalWithdrawals { get; set; }
        
        [Column("average_deposit_amount")]
        public decimal AverageDepositAmount { get; set; }
        
        [Column("login_count")]
        public int LoginCount { get; set; }
        
        [Column("segment")]
        public PlayerSegment Segment { get; set; }
        
        [Column("age")]
        public int Age { get; set; }
        
        [Column("gender")]
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
