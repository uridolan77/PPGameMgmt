using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.API.Gateways;
using PPGameMgmt.API.Gateways.Configuration;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.CQRS;
using PPGameMgmt.Infrastructure.Data.Migrations;
using PPGameMgmt.Infrastructure.Services;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for registering architecture patterns in the DI container
    /// </summary>
    public static class ArchitecturalPatternsExtensions
    {
        /// <summary>
        /// Adds all architectural pattern services to the service collection
        /// </summary>
        public static IServiceCollection AddArchitecturalPatterns(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Add Outbox Pattern
            services.AddOutboxPattern();
            
            // Add Gateway Pattern
            services.AddApiGateways(configuration);
            
            // Add Query Object Pattern
            services.AddQueryObjects();
            
            // Add Database Migrations
            services.AddDatabaseMigrations();
            
            return services;
        }
        
        /// <summary>
        /// Adds Outbox Pattern services to the service collection
        /// </summary>
        public static IServiceCollection AddOutboxPattern(this IServiceCollection services)
        {
            // Register Outbox repository
            services.AddScoped<IOutboxRepository, OutboxRepository>();
            
            // Register the background service for processing outbox messages
            services.AddHostedService<OutboxProcessor>();
            
            return services;
        }
        
        /// <summary>
        /// Adds API Gateway services to the service collection
        /// </summary>
        public static IServiceCollection AddApiGateways(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Configure payment gateway
            services.Configure<ApiGatewayOptions>(
                "PaymentGateway",
                configuration.GetSection("ApiGateways:PaymentGateway"));
            
            // Register payment gateway as a named HTTP client
            services.AddHttpClient<PaymentApiGateway>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5));
            
            return services;
        }
        
        /// <summary>
        /// Adds Query Object Pattern services to the service collection
        /// </summary>
        public static IServiceCollection AddQueryObjects(this IServiceCollection services)
        {
            // Register query processor
            services.AddScoped<IQueryProcessor, QueryProcessor>();
            
            // Register all query handlers using assembly scanning
            services.Scan(scan => scan
                .FromAssemblyOf<IQuery<object>>()
                .AddClasses(classes => classes.AssignableTo(typeof(IQueryHandler<,>)))
                .AsImplementedInterfaces()
                .WithScopedLifetime());
            
            return services;
        }
    }
}