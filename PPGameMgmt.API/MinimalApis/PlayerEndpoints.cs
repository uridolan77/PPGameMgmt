using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PPGameMgmt.API.MinimalApis
{
    public static class PlayerEndpoints
    {
        public static IEndpointRouteBuilder MapPlayerEndpoints(this IEndpointRouteBuilder endpoints)
        {
            // Get player count by segment
            endpoints.MapGet("/api/players/count/by-segment", async (IPlayerService playerService, ILogger<Program> logger) =>
            {
                try
                {
                    var countBySegment = new Dictionary<string, int>();
                    
                    foreach (PlayerSegment segment in Enum.GetValues(typeof(PlayerSegment)))
                    {
                        var players = await playerService.GetPlayersBySegmentAsync(segment);
                        countBySegment[segment.ToString()] = players.Count();
                    }
                    
                    return Results.Ok(countBySegment);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error retrieving player counts by segment");
                    return Results.Problem("Error retrieving player counts by segment", statusCode: 500);
                }
            })
            .WithName("GetPlayerCountBySegment")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets the count of players by segment";
                operation.Description = "Returns a dictionary with player segments as keys and counts as values";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Players" } };
                return operation;
            });

            // Check if a player is active
            endpoints.MapGet("/api/players/{id}/is-active", async (string id, int days, IPlayerService playerService, ILogger<Program> logger) =>
            {
                try
                {
                    var isActive = await playerService.IsPlayerActive(id, days);
                    return Results.Ok(new { isActive });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error checking if player {PlayerId} is active", id);
                    return Results.Problem("Error checking if player is active", statusCode: 500);
                }
            })
            .WithName("CheckPlayerActive")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Checks if a player is active";
                operation.Description = "Returns true if the player has been active within the specified number of days";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Players" } };
                return operation;
            });

            // Get player value
            endpoints.MapGet("/api/players/{id}/value", async (string id, IPlayerService playerService, ILogger<Program> logger) =>
            {
                try
                {
                    var playerValue = await playerService.GetPlayerValueAsync(id);
                    return Results.Ok(new { value = playerValue });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error retrieving value for player {PlayerId}", id);
                    return Results.Problem("Error retrieving player value", statusCode: 500);
                }
            })
            .WithName("GetPlayerValue")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets a player's value";
                operation.Description = "Returns the calculated value of a player based on their activity and deposits";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Players" } };
                return operation;
            });

            return endpoints;
        }
    }
}
