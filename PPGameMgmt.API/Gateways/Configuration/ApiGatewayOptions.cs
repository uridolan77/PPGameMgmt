using System;
using System.Collections.Generic;
using System.Text.Json;

namespace PPGameMgmt.API.Gateways.Configuration
{
    /// <summary>
    /// Configuration options for an API Gateway
    /// </summary>
    public class ApiGatewayOptions
    {
        /// <summary>
        /// Name of the gateway for identification and logging
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Base URL for the API
        /// </summary>
        public string BaseUrl { get; set; }
        
        /// <summary>
        /// Default headers to include with each request
        /// </summary>
        public Dictionary<string, string> DefaultHeaders { get; set; }
        
        /// <summary>
        /// Request timeout in seconds
        /// </summary>
        public int TimeoutSeconds { get; set; } = 30;
        
        /// <summary>
        /// Circuit breaker configuration
        /// </summary>
        public CircuitBreakerOptions CircuitBreaker { get; set; }
        
        /// <summary>
        /// JSON serializer options for serializing requests and deserializing responses
        /// </summary>
        public JsonSerializerOptions JsonSerializerOptions { get; set; } = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
    }
    
    /// <summary>
    /// Configuration options for a circuit breaker
    /// </summary>
    public class CircuitBreakerOptions
    {
        /// <summary>
        /// Number of failures before the circuit opens
        /// </summary>
        public int FailureThreshold { get; set; } = 3;
        
        /// <summary>
        /// Time to keep the circuit open before trying again
        /// </summary>
        public TimeSpan? OpenStateTimeout { get; set; } = TimeSpan.FromSeconds(30);
    }
}