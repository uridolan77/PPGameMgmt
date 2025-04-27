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
using PPGameMgmt.Infrastructure.Data.Contexts;
using PPGameMgmt.Infrastructure.Data.Repositories;
using PPGameMgmt.Infrastructure.ML.Features;
using PPGameMgmt.Infrastructure.ML.Models;
using PPGameMgmt.API.Middleware;

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
});

// Database context - Using MySQL with EF Core 7.0
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<CasinoDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 29)), // Specify your MySQL server version
        mySqlOptions => mySqlOptions.MigrationsAssembly("PPGameMgmt.Infrastructure")));

// Register repositories
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IBonusRepository, BonusRepository>();
builder.Services.AddScoped<IGameSessionRepository, GameSessionRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<IBonusClaimRepository, BonusClaimRepository>();

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
builder.Services.AddSingleton<IMLOpsService, MLOpsService>(); // Add MLOps service

// Add Redis distributed cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    options.InstanceName = "PPGameMgmt:";
});

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5000") // Updated to Vite's default port
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Remove the developer exception page as we're using our global exception handler
    // app.UseDeveloperExceptionPage();
}
else
{
    // Remove this line as we're using our global exception handler instead
    // app.UseExceptionHandler("/error");
    app.UseHsts();
}

// Add our global exception handling middleware - this should be one of the first middleware
app.UseGlobalExceptionHandling();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Create the database if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CasinoDbContext>();
        context.Database.EnsureCreated();
        
        // Initialize ML models
        var mlService = services.GetRequiredService<IMLModelService>();
        mlService.InitializeModelsAsync().Wait();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database or initializing ML models.");
    }
}

app.Run();