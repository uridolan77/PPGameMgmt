using System;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.API.Models.Requests
{
    /// <summary>
    /// Request model for claiming a bonus
    /// </summary>
    public class ClaimBonusRequest
    {
        /// <summary>
        /// ID of the bonus to claim
        /// </summary>
        public string BonusId { get; set; }
    }

    /// <summary>
    /// Request model for creating a new bonus
    /// </summary>
    public class CreateBonusRequest
    {
        /// <summary>
        /// Name of the bonus
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the bonus
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Type of the bonus
        /// </summary>
        public BonusType Type { get; set; }

        /// <summary>
        /// Value of the bonus
        /// </summary>
        public decimal Value { get; set; }

        /// <summary>
        /// Start date of the bonus
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the bonus
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Whether the bonus is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Whether the bonus is global (available to all players)
        /// </summary>
        public bool IsGlobal { get; set; }

        /// <summary>
        /// Target segment for the bonus (if not global)
        /// </summary>
        public PlayerSegment? TargetSegment { get; set; }

        /// <summary>
        /// ID of the game associated with the bonus (if any)
        /// </summary>
        public string GameId { get; set; }
    }
}
