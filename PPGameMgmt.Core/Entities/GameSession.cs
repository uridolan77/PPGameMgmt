using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("game_sessions")]
    public class GameSession
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("player_id")]
        public string PlayerId { get; set; }
        
        [Column("game_id")]
        public string GameId { get; set; }
        
        [Column("start_time")]
        public DateTime StartTime { get; set; }
        
        [Column("end_time")]
        public DateTime? EndTime { get; set; }
        
        public TimeSpan? Duration => EndTime.HasValue ? EndTime - StartTime : null;
        
        [Column("total_bets")]
        public decimal TotalBets { get; set; }
        
        [Column("total_wins")]
        public decimal TotalWins { get; set; }
        
        public decimal NetResult => TotalWins - TotalBets;
        
        [Column("total_spins")]
        public int TotalSpins { get; set; }
        
        [Column("total_hands")]
        public int TotalHands { get; set; }
        
        [Column("device_type")]
        public string DeviceType { get; set; }
        
        [Column("browser_info")]
        public string BrowserInfo { get; set; }
        
        [Column("applied_bonus_id")]
        public string? AppliedBonusId { get; set; }
        
        [Column("deposit_amount")]
        public decimal DepositAmount { get; set; }
        
        [Column("withdrawal_amount")]
        public decimal WithdrawalAmount { get; set; }
        
        // This is a derived property - not mapped to a db column
        [NotMapped]
        public GameCategory GameCategory { get; set; }
        
        // Navigation properties
        [NotMapped]
        public Player Player { get; set; }
        
        [NotMapped]
        public Game Game { get; set; }
    }
}