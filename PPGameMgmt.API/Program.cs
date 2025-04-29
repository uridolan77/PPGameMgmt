using System;
using System.Reflection;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using PPGameMgmt.Core.CQRS.Events;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Services;
using PPGameMgmt.Infrastructure.CQRS;
using PPGameMgmt.Infrastructure.Data;
using PPGameMgmt.Infrastructure.Data.Contexts;
using PPGameMgmt.Infrastructure.Data.Repositories;
using PPGameMgmt.Infrastructure.ML.Features;
using PPGameMgmt.Infrastructure.ML.Models;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog;
using Serilog.Events;
using PPGameMgmt.API.HealthChecks;
using PPGameMgmt.API.Middleware;
using PPGameMgmt.API.Hubs;
using PPGameMgmt.API.Services;
using PPGameMgmt.API.Swagger;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", true)
        .Build())
    .CreateLogger();

try
{
    Log.Information("Starting PPGameMgmt API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddFluentValidation(fv =>
    {
        fv.RegisterValidatorsFromAssemblyContaining<Program>();
        fv.ImplicitlyValidateChildProperties = true;
        fv.ImplicitlyValidateRootCollectionElements = true;
    });
builder.Services.AddEndpointsApiExplorer();

// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Configure Swagger with API versioning
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PPGameMgmt API v1",
        Version = "v1",
        Description = "API for managing personalized player game recommendations and bonuses"
    });

    c.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "PPGameMgmt API v2",
        Version = "v2",
        Description = "API for managing personalized player game recommendations and bonuses (v2)"
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

    // Configure the Swagger doc to work with API versioning
    c.OperationFilter<SwaggerDefaultValues>();
});

// Add API Management configuration
builder.Services.AddApiManagementConfiguration(builder.Configuration);

// Add Rate Limiting configuration
builder.Services.AddRateLimitingConfiguration(builder.Configuration);

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database_health_check", tags: new[] { "database" })
    .AddCheck<RedisHealthCheck>("redis_health_check", tags: new[] { "redis" })
    .AddCheck<MLModelHealthCheck>("ml_model_health_check", tags: new[] { "ml" });

// Add Authorization with policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanManagePlayers", policy =>
        policy.RequireClaim("Permission", "players.manage"));

    options.AddPolicy("CanViewBonuses", policy =>
        policy.RequireClaim("Permission", "bonuses.view"));

    options.AddPolicy("CanManageBonuses", policy =>
        policy.RequireClaim("Permission", "bonuses.manage"));

    options.AddPolicy("CanViewGames", policy =>
        policy.RequireClaim("Permission", "games.view"));

    options.AddPolicy("CanManageGames", policy =>
        policy.RequireClaim("Permission", "games.manage"));

    options.AddPolicy("CanViewRecommendations", policy =>
        policy.RequireClaim("Permission", "recommendations.view"));

    options.AddPolicy("CanManageRecommendations", policy =>
        policy.RequireClaim("Permission", "recommendations.manage"));

    options.AddPolicy("IsAdmin", policy =>
        policy.RequireClaim("Role", "admin"));
});

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

// Register MediatR for CQRS
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(PPGameMgmt.Core.CQRS.Commands.Players.UpdatePlayerSegmentCommand).Assembly);
});

// Register Domain Event Dispatcher
builder.Services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

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
builder.Services.AddScoped<PlayerService>();
builder.Services.AddScoped<GameService>();
builder.Services.AddScoped<BonusService>();
builder.Services.AddScoped<RecommendationService>();
builder.Services.AddScoped<IBonusOptimizationService, BonusOptimizationService>();

// Register cached service decorators
builder.Services.AddScoped<IPlayerService>(provider =>
    new CachedPlayerService(
        provider.GetRequiredService<PlayerService>(),
        provider.GetRequiredService<ICacheService>(),
        provider.GetRequiredService<ILogger<CachedPlayerService>>()));

builder.Services.AddScoped<IGameService>(provider =>
    new CachedGameService(
        provider.GetRequiredService<GameService>(),
        provider.GetRequiredService<ICacheService>(),
        provider.GetRequiredService<ILogger<CachedGameService>>()));

builder.Services.AddScoped<IBonusService>(provider =>
    new CachedBonusService(
        provider.GetRequiredService<BonusService>(),
        provider.GetRequiredService<ICacheService>(),
        provider.GetRequiredService<ILogger<CachedBonusService>>()));

builder.Services.AddScoped<IRecommendationService>(provider =>
    new CachedRecommendationService(
        provider.GetRequiredService<RecommendationService>(),
        provider.GetRequiredService<ICacheService>(),
        provider.GetRequiredService<ILogger<CachedRecommendationService>>()));

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
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "PPGameMgmt API v1");
        options.SwaggerEndpoint("/swagger/v2/swagger.json", "PPGameMgmt API v2");
    });
}
else
{
    app.UseHsts();
}

// Add our global exception handling middleware - this should be one of the first middleware
app.UseGlobalExceptionHandling();

// Add request logging middleware for enriched logs
app.UseRequestLogging();

// Add API Management middleware - place after exception handling but before other middleware
app.UseApiManagement();

// Add Rate Limiting middleware
app.UseRateLimiting();

app.UseHttpsRedirection();
app.UseResponseCaching(); // Enable response caching
app.UseCors("AllowFrontend");
app.UseAuthorization();

// Map SignalR hub
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapControllers();

// Map health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse,
    AllowCachingResponses = false
});

app.MapHealthChecks("/health/database", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse,
    Predicate = healthCheck => healthCheck.Tags.Contains("database"),
    AllowCachingResponses = false
});

app.MapHealthChecks("/health/redis", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse,
    Predicate = healthCheck => healthCheck.Tags.Contains("redis"),
    AllowCachingResponses = false
});

app.MapHealthChecks("/health/ml", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse,
    Predicate = healthCheck => healthCheck.Tags.Contains("ml"),
    AllowCachingResponses = false
});

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
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}