using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPGameMgmt.API.MinimalApis
{
    public static class GameEndpoints
    {
        public static IEndpointRouteBuilder MapGameEndpoints(this IEndpointRouteBuilder endpoints)
        {
            // Get game count by type
            endpoints.MapGet("/api/games/count/by-type", async (IGameService gameService, ILogger<Program> logger) =>
            {
                try
                {
                    var allGames = await gameService.GetAllGamesAsync();
                    
                    var countByType = Enum.GetValues(typeof(GameType))
                        .Cast<GameType>()
                        .ToDictionary(
                            type => type.ToString(),
                            type => allGames.Count(g => g.Type == type)
                        );
                    
                    return Results.Ok(countByType);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error retrieving game counts by type");
                    return Results.Problem("Error retrieving game counts by type", statusCode: 500);
                }
            })
            .WithName("GetGameCountByType")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets the count of games by type";
                operation.Description = "Returns a dictionary with game types as keys and counts as values";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Games" } };
                return operation;
            });

            // Get game count by category
            endpoints.MapGet("/api/games/count/by-category", async (IGameService gameService, ILogger<Program> logger) =>
            {
                try
                {
                    var allGames = await gameService.GetAllGamesAsync();
                    
                    var countByCategory = Enum.GetValues(typeof(GameCategory))
                        .Cast<GameCategory>()
                        .ToDictionary(
                            category => category.ToString(),
                            category => allGames.Count(g => g.Category == category)
                        );
                    
                    return Results.Ok(countByCategory);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error retrieving game counts by category");
                    return Results.Problem("Error retrieving game counts by category", statusCode: 500);
                }
            })
            .WithName("GetGameCountByCategory")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets the count of games by category";
                operation.Description = "Returns a dictionary with game categories as keys and counts as values";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Games" } };
                return operation;
            });

            // Check if a game exists
            endpoints.MapGet("/api/games/{id}/exists", async (string id, IGameService gameService, ILogger<Program> logger) =>
            {
                try
                {
                    var game = await gameService.GetGameAsync(id);
                    return Results.Ok(new { exists = game != null });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error checking if game {GameId} exists", id);
                    return Results.Problem("Error checking if game exists", statusCode: 500);
                }
            })
            .WithName("CheckGameExists")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Checks if a game exists";
                operation.Description = "Returns true if the game exists, false otherwise";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Games" } };
                return operation;
            });

            // Toggle game status (active/inactive)
            endpoints.MapPatch("/api/games/{id}/toggle-status", async (string id, IGameService gameService, ILogger<Program> logger) =>
            {
                try
                {
                    var game = await gameService.GetGameAsync(id);
                    
                    if (game == null)
                    {
                        return Results.NotFound($"Game with ID {id} not found");
                    }
                    
                    // Toggle the status
                    game.IsActive = !game.IsActive;
                    
                    // Update the game
                    var updatedGame = await gameService.UpdateGameAsync(game);
                    
                    // Convert to DTO
                    var gameDto = GameDto.FromEntity(updatedGame);
                    
                    return Results.Ok(gameDto);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error toggling status for game {GameId}", id);
                    return Results.Problem("Error toggling game status", statusCode: 500);
                }
            })
            .WithName("ToggleGameStatus")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Toggles a game's active status";
                operation.Description = "Switches a game between active and inactive states";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Games" } };
                return operation;
            });

            return endpoints;
        }
    }
}
