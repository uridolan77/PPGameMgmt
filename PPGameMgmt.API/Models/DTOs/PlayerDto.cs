using System;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for Player entity
    /// </summary>
    public class PlayerDto
    {
        /// <summary>
        /// Player's unique identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Player's username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Player's email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Player's country code
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// Player's preferred language
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// Player's segment
        /// </summary>
        public PlayerSegment Segment { get; set; }

        /// <summary>
        /// Date the player registered
        /// </summary>
        public DateTime RegistrationDate { get; set; }

        /// <summary>
        /// Date of the player's last login
        /// </summary>
        public DateTime LastLoginDate { get; set; }

        /// <summary>
        /// Sum of all deposits made by the player
        /// </summary>
        public decimal TotalDeposits { get; set; }

        /// <summary>
        /// Sum of all withdrawals made by the player
        /// </summary>
        public decimal TotalWithdrawals { get; set; }

        /// <summary>
        /// Calculated value of the player (deposits - withdrawals)
        /// </summary>
        public decimal PlayerValue => TotalDeposits - TotalWithdrawals;

        /// <summary>
        /// Number of days since the player registered
        /// </summary>
        public int DaysSinceRegistration => (int)(DateTime.UtcNow - RegistrationDate).TotalDays;

        /// <summary>
        /// Number of days since the player's last login
        /// </summary>
        public int DaysSinceLastLogin => (int)(DateTime.UtcNow - LastLoginDate).TotalDays;
    }
}