using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for Game entity
    /// </summary>
    public class GameDto
    {
        /// <summary>
        /// Game's unique identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the game
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Game provider/manufacturer
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// Brief description of the game
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Return to player percentage
        /// </summary>
        public decimal RTP { get; set; }

        /// <summary>
        /// Type of game (Slot, Table, etc.)
        /// </summary>
        public GameType Type { get; set; }

        /// <summary>
        /// Category of the game (Adventure, Classic, etc.)
        /// </summary>
        public GameCategory Category { get; set; }

        /// <summary>
        /// Minimum allowed bet
        /// </summary>
        public decimal MinimumBet { get; set; }

        /// <summary>
        /// Maximum allowed bet
        /// </summary>
        public decimal MaximumBet { get; set; }

        /// <summary>
        /// URL to the game's thumbnail image
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// URL to play the game
        /// </summary>
        public string GameUrl { get; set; }

        /// <summary>
        /// Game's popularity score
        /// </summary>
        public int PopularityScore { get; set; }

        /// <summary>
        /// Whether the game is currently featured
        /// </summary>
        public bool IsFeatured { get; set; }

        /// <summary>
        /// Whether this is a new release
        /// </summary>
        public bool IsNewRelease { get; set; }
    }
}