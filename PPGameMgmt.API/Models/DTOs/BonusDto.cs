using System;
using System.Collections.Generic;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for Bonus entity
    /// </summary>
    public class BonusDto
    {
        /// <summary>
        /// Bonus unique identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the bonus
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the bonus
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Fixed bonus amount (if applicable)
        /// </summary>
        public decimal? Amount { get; set; }

        /// <summary>
        /// Percentage match for deposit bonuses
        /// </summary>
        public decimal? PercentageMatch { get; set; }

        /// <summary>
        /// Type of bonus (Welcome, Deposit, Free spins, etc.)
        /// </summary>
        public BonusType Type { get; set; }

        /// <summary>
        /// Minimum deposit required to claim the bonus
        /// </summary>
        public decimal MinimumDeposit { get; set; }

        /// <summary>
        /// Wagering requirement multiplier
        /// </summary>
        public int WageringRequirement { get; set; }

        /// <summary>
        /// Date when the bonus becomes available
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// Date when the bonus expires
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Target segment for this bonus
        /// </summary>
        public PlayerSegment TargetSegment { get; set; }

        /// <summary>
        /// Game IDs that this bonus can be used on
        /// </summary>
        public ICollection<string> ApplicableGameIds { get; set; }

        /// <summary>
        /// Segments this bonus targets (for multi-segment bonuses)
        /// </summary>
        public ICollection<PlayerSegment> TargetSegments { get; set; }

        /// <summary>
        /// Maximum bonus amount that can be awarded
        /// </summary>
        public decimal? MaxBonusAmount { get; set; }

        /// <summary>
        /// Deadline to complete the wagering requirements (days)
        /// </summary>
        public int? WageringDeadlineDays { get; set; }

        /// <summary>
        /// Whether this bonus is currently active
        /// </summary>
        public bool IsActive { get; set; }
    }
}