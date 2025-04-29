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
        
        [Column("total_bets")]
        public decimal TotalBets { get; set; }
        
        [Column("total_wins")]
        public decimal TotalWins { get; set; }
        
        [Column("device_type")]
        public string DeviceType { get; set; }
        
        [Column("browser_info")]
        public string BrowserInfo { get; set; }
        
        [Column("deposit_amount")]
        public decimal DepositAmount { get; set; }
        
        [Column("withdrawal_amount")]
        public decimal WithdrawalAmount { get; set; }
        
        [Column("duration_minutes")]
        public int DurationMinutes { get; set; }
        
        // Navigation properties
        public Player Player { get; set; }
        public Game Game { get; set; }
        
        // Helper methods
        public decimal GetNetResult() => TotalWins - TotalBets;
        
        public bool IsProfit() => GetNetResult() > 0;
    }
}