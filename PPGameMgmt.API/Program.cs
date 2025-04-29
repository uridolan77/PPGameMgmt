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
using Serilog;
using System;

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
        .AddFluentValidation(fv =>
        {
            fv.RegisterValidatorsFromAssemblyContaining<Program>();
            fv.ImplicitlyValidateChildProperties = true;
            fv.ImplicitlyValidateRootCollectionElements = true;
        })
        .AddEndpointsApiExplorer()
        
        // Add API Management and Rate Limiting
        .AddApiManagementConfiguration(builder.Configuration)
        .AddRateLimitingConfiguration(builder.Configuration)
        
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
        
        // Domain services
        .AddScoped<IDomainEventDispatcher, DomainEventDispatcher>()
        .AddScoped<INotificationService, NotificationService>()
        
        // Add repositories, services, and ML components
        .AddRepositories()
        .AddCoreServices()
        .AddCachedServices()
        .AddMLServices();

    var app = builder.Build();

    // Configure the HTTP request pipeline using our extension methods
    app.ConfigureMiddleware(builder.Configuration)
       .ConfigureHealthChecks()
       .ConfigureEndpoints();

    // Test database connection at startup and initialize ML models
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