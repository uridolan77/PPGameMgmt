using System.Reflection;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Entities.Recommendations;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Filter to add example values to Swagger documentation
    /// </summary>
    public class SwaggerExampleFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == null)
                return;

            // Add examples based on type
            if (context.Type == typeof(Player))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("player-123"),
                    ["username"] = new OpenApiString("johndoe"),
                    ["email"] = new OpenApiString("john.doe@example.com"),
                    ["country"] = new OpenApiString("US"),
                    ["segment"] = new OpenApiString("HighValue"),
                    ["registrationDate"] = new OpenApiDateTime(DateTime.UtcNow.AddDays(-30)),
                    ["lastLoginDate"] = new OpenApiDateTime(DateTime.UtcNow.AddDays(-2)),
                    ["totalDeposits"] = new OpenApiDouble(1000.0),
                    ["totalWithdrawals"] = new OpenApiDouble(200.0)
                };
            }
            else if (context.Type == typeof(Game))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("game-456"),
                    ["name"] = new OpenApiString("Mega Slots"),
                    ["description"] = new OpenApiString("An exciting slot game with multiple bonus features"),
                    ["type"] = new OpenApiString("Slot"),
                    ["category"] = new OpenApiString("Featured"),
                    ["provider"] = new OpenApiString("GameProvider Inc."),
                    ["releaseDate"] = new OpenApiDateTime(DateTime.UtcNow.AddMonths(-3)),
                    ["rtp"] = new OpenApiDouble(96.5),
                    ["volatility"] = new OpenApiString("Medium"),
                    ["isActive"] = new OpenApiBoolean(true)
                };
            }
            else if (context.Type == typeof(Core.Entities.Bonuses.Bonus))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("bonus-789"),
                    ["name"] = new OpenApiString("Welcome Bonus"),
                    ["description"] = new OpenApiString("100% match on your first deposit up to $100"),
                    ["type"] = new OpenApiString("Deposit"),
                    ["value"] = new OpenApiDouble(100.0),
                    ["startDate"] = new OpenApiDateTime(DateTime.UtcNow.AddDays(-10)),
                    ["endDate"] = new OpenApiDateTime(DateTime.UtcNow.AddDays(20)),
                    ["isActive"] = new OpenApiBoolean(true),
                    ["isGlobal"] = new OpenApiBoolean(false),
                    ["targetSegment"] = new OpenApiString("NewPlayer")
                };
            }
            else if (context.Type == typeof(Core.Entities.Bonuses.BonusClaim))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("claim-101112"),
                    ["playerId"] = new OpenApiString("player-123"),
                    ["bonusId"] = new OpenApiString("bonus-789"),
                    ["claimDate"] = new OpenApiDateTime(DateTime.UtcNow.AddDays(-5)),
                    ["status"] = new OpenApiString("Claimed")
                };
            }
            else if (context.Type == typeof(GameSession))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("session-131415"),
                    ["playerId"] = new OpenApiString("player-123"),
                    ["gameId"] = new OpenApiString("game-456"),
                    ["startTime"] = new OpenApiDateTime(DateTime.UtcNow.AddHours(-2)),
                    ["endTime"] = new OpenApiDateTime(DateTime.UtcNow.AddHours(-1)),
                    ["duration"] = new OpenApiInteger(60),
                    ["totalBets"] = new OpenApiDouble(50.0),
                    ["totalWins"] = new OpenApiDouble(45.0),
                    ["netProfit"] = new OpenApiDouble(-5.0)
                };
            }
            else if (context.Type == typeof(Recommendation))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiString("rec-161718"),
                    ["playerId"] = new OpenApiString("player-123"),
                    ["createdAt"] = new OpenApiDateTime(DateTime.UtcNow.AddHours(-1)),
                    ["gameRecommendations"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["gameId"] = new OpenApiString("game-456"),
                            ["score"] = new OpenApiDouble(0.95),
                            ["reason"] = new OpenApiString("Based on your playing history")
                        }
                    },
                    ["bonusRecommendation"] = new OpenApiObject
                    {
                        ["bonusId"] = new OpenApiString("bonus-789"),
                        ["score"] = new OpenApiDouble(0.85),
                        ["reason"] = new OpenApiString("Matches your player profile")
                    }
                };
            }
        }
    }
}
