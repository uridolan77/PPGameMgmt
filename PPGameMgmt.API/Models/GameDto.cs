using System;
using System.Collections.Generic;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Data Transfer Object for Game entity
    /// </summary>
    public class GameDto
    {
        // Properties matching the frontend expectations
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Provider { get; set; }
        public string Category { get; set; }
        public string Type { get; set; }
        public string Genre { get; set; }
        public bool IsFeatured { get; set; }
        public decimal RTP { get; set; }
        public decimal MinBet { get; set; }
        public decimal MaxBet { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string ThumbnailUrl { get; set; }
        public string GameUrl { get; set; }
        public bool IsActive { get; set; }
        public int Popularity { get; set; }
        public string Volatility { get; set; }
        public string[] CompatibleDevices { get; set; }
        public string[] Features { get; set; }

        // Static method to map from Game entity to GameDto
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
                CompatibleDevices = game.CompatibleDevices,
                Features = game.Features
            };
        }

        // Static method to map a collection of Game entities to GameDtos
        public static IEnumerable<GameDto> FromEntities(IEnumerable<Game> games)
        {
            if (games == null)
                return new List<GameDto>();

            var gameDtos = new List<GameDto>();
            foreach (var game in games)
            {
                gameDtos.Add(FromEntity(game));
            }
            return gameDtos;
        }
    }
}
