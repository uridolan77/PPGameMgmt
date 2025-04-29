using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using PPGameMgmt.API.HealthChecks;
using PPGameMgmt.API.Swagger;
using System;
using System.IO;
using System.Reflection;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for API-specific configurations
    /// </summary>
    public static class ApiExtensions
    {
        /// <summary>
        /// Adds API versioning and Swagger configuration
        /// </summary>
        public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
        {
            // Add API Versioning
            services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
            });

            services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });

            // Configure Swagger
            services.AddSwaggerGen(c =>
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

                // Add documentation filters
                c.OperationFilter<SwaggerDocumentationFilter>();
                c.SchemaFilter<SwaggerExampleFilter>();

                // Include XML comments if available
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }
            });

            return services;
        }

        /// <summary>
        /// Adds health checks for monitoring system health
        /// </summary>
        public static IServiceCollection AddHealthChecksConfiguration(this IServiceCollection services)
        {
            services.AddHealthChecks()
                .AddCheck<DatabaseHealthCheck>("database_health_check", tags: new[] { "database" })
                .AddCheck<RedisHealthCheck>("redis_health_check", tags: new[] { "redis" })
                .AddCheck<MLModelHealthCheck>("ml_model_health_check", tags: new[] { "ml" });

            return services;
        }

        /// <summary>
        /// Adds API controllers with standardized response caching
        /// </summary>
        public static IServiceCollection AddApiControllers(this IServiceCollection services)
        {
            services.AddResponseCaching();
            
            services.AddControllers(options =>
            {
                options.CacheProfiles.Add("Default30",
                    new CacheProfile()
                    {
                        Duration = 30
                    });
                options.CacheProfiles.Add("Default60",
                    new CacheProfile()
                    {
                        Duration = 60
                    });
            });

            return services;
        }

        /// <summary>
        /// Adds CORS policy configuration
        /// </summary>
        public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
        {
            // Get allowed origins from configuration or use defaults
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? 
                new[] {
                    "http://localhost:55824",
                    "https://localhost:55824",
                    "http://localhost:5824",
                    "https://localhost:7210"
                };

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials(); // Required for SignalR
                });
            });

            return services;
        }
    }
}