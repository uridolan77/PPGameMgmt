using System;
using System.Collections.Generic;
using System.Linq;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Data Transfer Object for Game entity
    /// </summary>
    public class GameDto
    {
        /// <summary>
        /// Unique identifier for the game
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the game
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Description of the game
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Provider of the game
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// Category of the game
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Type of the game
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Genre of the game
        /// </summary>
        public string Genre { get; set; }

        /// <summary>
        /// Whether the game is featured
        /// </summary>
        public bool IsFeatured { get; set; }

        /// <summary>
        /// RTP (Return to Player) percentage
        /// </summary>
        public decimal RTP { get; set; }

        /// <summary>
        /// Minimum bet amount
        /// </summary>
        public decimal MinBet { get; set; }

        /// <summary>
        /// Maximum bet amount
        /// </summary>
        public decimal MaxBet { get; set; }

        /// <summary>
        /// Release date of the game
        /// </summary>
        public DateTime ReleaseDate { get; set; }

        /// <summary>
        /// URL to the game's thumbnail image
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// URL to play the game
        /// </summary>
        public string GameUrl { get; set; }

        /// <summary>
        /// Whether the game is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Popularity score of the game
        /// </summary>
        public int Popularity { get; set; }

        /// <summary>
        /// Volatility level description
        /// </summary>
        public string Volatility { get; set; }

        /// <summary>
        /// Devices compatible with the game
        /// </summary>
        public string[] CompatibleDevices { get; set; }

        /// <summary>
        /// Features of the game
        /// </summary>
        public string[] Features { get; set; }

        /// <summary>
        /// Convert a Game entity to a GameDto
        /// </summary>
        public static GameDto FromEntity(Game game)
        {
            if (game == null)
                return null;

            return new GameDto
            {
                Id = game.Id,
                Title = game.Name,
                Description = game.Description,
                Provider = game.Provider,
                Category = game.Category.ToString(),
                Type = game.Type.ToString(),
                Genre = game.Genre,
                IsFeatured = game.IsFeatured,
                RTP = game.RTP,
                MinBet = game.MinimumBet,
                MaxBet = game.MaximumBet,
                ReleaseDate = game.ReleaseDate,
                ThumbnailUrl = game.ThumbnailUrl,
                GameUrl = game.GameUrl,
                IsActive = game.IsActive,
                Popularity = game.PopularityScore,
                Volatility = GetVolatilityDescription(game.RTP),
                CompatibleDevices = game.CompatibleDevices ?? [],
                Features = game.Features ?? []
            };
        }

        /// <summary>
        /// Convert a collection of Game entities to GameDtos
        /// </summary>
        public static IEnumerable<GameDto> FromEntities(IEnumerable<Game> games)
        {
            if (games == null)
                return [];

            return games.Select(FromEntity).ToList();
        }

        /// <summary>
        /// Get a description of volatility based on RTP
        /// </summary>
        private static string GetVolatilityDescription(decimal rtp)
        {
            return rtp switch
            {
                >= 97m => "Low",
                >= 94m and < 97m => "Medium",
                >= 90m and < 94m => "High",
                _ => "Very High"
            };
        }
    }
}
