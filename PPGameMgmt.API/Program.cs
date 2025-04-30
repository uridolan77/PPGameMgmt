using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Extensions;
using PPGameMgmt.Core.CQRS.Events;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.CQRS;
using PPGameMgmt.Infrastructure.Data.Contexts;
using PPGameMgmt.API.Services;
using PPGameMgmt.API.Middleware;
using Serilog;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using FluentValidation.AspNetCore;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

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

    // Add services to the container using our extension methods
    builder.Services
        // API-related services
        .AddApiDocumentation()
        .AddHealthChecksConfiguration()
        .AddApiControllers()
        .AddCorsPolicy(builder.Configuration)
        // Update FluentValidation registration to use current approach
        .AddFluentValidationAutoValidation()
        .AddFluentValidationClientsideAdapters()
        .AddValidatorsFromAssemblyContaining<Program>()
        .AddEndpointsApiExplorer()

        // Add AutoMapper
        .AddAutoMapperServices()

        // Add API Management and Rate Limiting
        .AddApiManagementConfiguration(builder.Configuration)
        .AddRateLimitingConfiguration(builder.Configuration)

        // Add Architecture Patterns Implementation
        .AddArchitecturalPatterns(builder.Configuration)

        // Authentication and Authorization
        .AddAuthorization(options =>
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
        })

        // Database and caching
        .AddDatabase(builder.Configuration)
        .AddCachingServices(builder.Configuration)

        // Register MediatR for CQRS
        .AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(typeof(PPGameMgmt.Core.CQRS.Commands.Players.UpdatePlayerSegmentCommand).Assembly);
        })

        // Authentication services
        .AddAuthenticationServices(builder.Configuration)

        // Domain services
        .AddScoped<IDomainEventDispatcher, DomainEventDispatcher>()
        .AddScoped<INotificationService, NotificationService>()

        // Add repositories, services, and ML components
        .AddRepositories()
        .RegisterOutboxRepository() // Fix for OutboxRepository registration
        .AddCoreServices()
        .AddCachedServices()
        .DisableRedisCache() // Use in-memory cache instead of Redis
        .AddMLServices();

    WebApplication app;
    try
    {
        app = builder.Build();
        Log.Information("Successfully built the application");
    }
    catch (AggregateException aggEx)
    {
        Log.Fatal(aggEx, "Failed to build the application due to dependency injection errors");

        // Log details of each inner exception
        foreach (var innerEx in aggEx.InnerExceptions)
        {
            Log.Fatal(innerEx, "Inner exception details");

            // If it's a dependency injection exception, try to get more details
            if (innerEx is InvalidOperationException ioe && ioe.Message.Contains("service"))
            {
                Log.Fatal("Dependency injection error: {Message}", ioe.Message);
            }
        }

        throw; // Re-throw to terminate the application
    }

    // Configure the HTTP request pipeline using our extension methods
    app.ConfigureMiddleware(builder.Configuration)
       .ConfigureHealthChecks()
       .ConfigureEndpoints();

    // Test database connection at startup and initialize ML models
    await InitializeDatabaseAndModels(app);

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

// Move the initialization logic to a separate method for better organization
async Task InitializeDatabaseAndModels(WebApplication app)
{
    // Create a scope for database initialization
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Testing database connection...");
            var context = services.GetRequiredService<CasinoDbContext>();

            // Test database connection using CanConnect() which doesn't keep the connection open
            if (await context.Database.CanConnectAsync())
            {
                logger.LogInformation("Successfully connected to database!");

                // Run pending migrations if any
                try
                {
                    var migrationRunner = services.GetRequiredService<PPGameMgmt.Infrastructure.Data.Migrations.MigrationRunner>();
                    var pendingMigrations = await migrationRunner.GetPendingMigrationsAsync();

                    if (pendingMigrations.Any())
                    {
                        logger.LogInformation($"Applying {pendingMigrations.Count} database migrations...");
                        await migrationRunner.ApplyPendingMigrationsAsync();
                        logger.LogInformation("Database migrations applied successfully.");
                    }
                    else
                    {
                        logger.LogInformation("No pending database migrations.");
                    }
                }
                catch (Exception migEx)
                {
                    logger.LogError(migEx, "An error occurred while running database migrations.");
                }
            }
            else
            {
                logger.LogError("Failed to connect to the database.");
            }

            // Initialize ML models in a separate try-catch to prevent startup failure
            try
            {
                logger.LogInformation("Initializing ML models...");
                var mlService = services.GetRequiredService<IMLModelService>();
                await mlService.InitializeModelsAsync();
                logger.LogInformation("ML models initialized successfully.");
            }
            catch (Exception mlEx)
            {
                logger.LogWarning(mlEx, "ML model initialization failed but API will continue to start");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during application initialization.");

            // Log inner exception details to help with debugging
            if (ex.InnerException != null)
            {
                logger.LogError(ex.InnerException, "Inner exception details");
            }
        }
    }
}