using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Services;
using PPGameMgmt.Infrastructure.Data;
using PPGameMgmt.Infrastructure.Data.Contexts;
using PPGameMgmt.Infrastructure.Data.Repositories;
using PPGameMgmt.Infrastructure.ML.Features;
using PPGameMgmt.Infrastructure.ML.Models;
using PPGameMgmt.API.Middleware;
using PPGameMgmt.API.Hubs;
using PPGameMgmt.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PPGameMgmt API",
        Version = "v1",
        Description = "API for managing personalized player game recommendations and bonuses"
    });

    // Add security definition for API Management subscription key
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Name = "Ocp-Apim-Subscription-Key",
        Description = "API Management subscription key"
    });

    // Make sure all endpoints use the API key
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] {}
        }
    });
});

// Add API Management configuration
builder.Services.AddApiManagementConfiguration(builder.Configuration);

// Database context - Using MySQL with EF Core
var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");
Console.WriteLine($"Using MySQL Connection: {connectionString}");
builder.Services.AddDbContext<CasinoDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.MigrationsAssembly("PPGameMgmt.Infrastructure")));

// Add Redis distributed cache with abortConnect=false already set in config
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
Console.WriteLine($"Using Redis Connection: {redisConnectionString}");
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
    options.InstanceName = "PPGameMgmt:";
});

// Register Redis cache service
builder.Services.AddScoped<ICacheService, RedisCacheService>();

// Add SignalR with Redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString, options =>
    {
        options.Configuration.ChannelPrefix = "PPGameMgmt:SignalR";
    });

// Register NotificationService
builder.Services.AddScoped<INotificationService, NotificationService>();

// Register repositories
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IBonusRepository, BonusRepository>();
builder.Services.AddScoped<IGameSessionRepository, GameSessionRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<IBonusClaimRepository, BonusClaimRepository>();
builder.Services.AddScoped<IPlayerFeaturesRepository, PlayerFeaturesRepository>();

// Register Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IBonusService, BonusService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IBonusOptimizationService, BonusOptimizationService>();

// Register ML components
builder.Services.AddSingleton<BackgroundFeatureProcessor>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<BackgroundFeatureProcessor>());
builder.Services.AddScoped<IFeatureEngineeringService, FeatureEngineeringService>();
builder.Services.AddScoped<GameRecommendationModel>();
builder.Services.AddScoped<BonusOptimizationModel>();
builder.Services.AddScoped<IMLModelService, MLModelService>();
builder.Services.AddSingleton<IMLOpsService, MLOpsService>();

// Add API response caching using Redis
builder.Services.AddResponseCaching();
builder.Services.AddControllers(options =>
{
    options.CacheProfiles.Add("Default30",
        new Microsoft.AspNetCore.Mvc.CacheProfile()
        {
            Duration = 30
        });
    options.CacheProfiles.Add("Default60",
        new Microsoft.AspNetCore.Mvc.CacheProfile()
        {
            Duration = 60
        });
});

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:55824",
                "https://localhost:55824",
                "http://localhost:5824",
                "https://localhost:7210"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

// Add our global exception handling middleware - this should be one of the first middleware
app.UseGlobalExceptionHandling();

// Add API Management middleware - place after exception handling but before other middleware
app.UseApiManagement();

app.UseHttpsRedirection();
app.UseResponseCaching(); // Enable response caching
app.UseCors("AllowFrontend");
app.UseAuthorization();

// Map SignalR hub
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapControllers();

// Test database connection at startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CasinoDbContext>();

        Console.WriteLine("Testing database connection...");
        if (context.Database.CanConnect())
        {
            Console.WriteLine("Successfully connected to MySQL database!");
        }
        else
        {
            Console.WriteLine("Failed to connect to the database.");
        }

        // Initialize ML models - wrap in try-catch to prevent startup failure
        try
        {
            var mlService = services.GetRequiredService<IMLModelService>();
            mlService.InitializeModelsAsync().Wait();
            Console.WriteLine("ML models initialized successfully.");
        }
        catch (Exception mlEx)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(mlEx, "ML model initialization failed but API will continue to start");
            Console.WriteLine($"ML model initialization warning: {mlEx.Message}");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while connecting to the database or initializing ML models.");
        Console.WriteLine($"Error: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
        }
    }
}

app.Run();