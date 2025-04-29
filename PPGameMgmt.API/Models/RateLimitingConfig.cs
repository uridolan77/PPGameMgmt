using System.Collections.Generic;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Configuration for rate limiting
    /// </summary>
    public class RateLimitingConfig
    {
        /// <summary>
        /// Whether rate limiting is enabled
        /// </summary>
        public bool EnableRateLimiting { get; set; } = true;
        
        /// <summary>
        /// Number of requests allowed per minute per client
        /// </summary>
        public int RequestsPerMinute { get; set; } = 60;
        
        /// <summary>
        /// List of API paths that are exempt from rate limiting
        /// Format: "/api/controller" or "/api/controller/action"
        /// </summary>
        public List<string> ExemptPaths { get; set; } = new List<string>();
    }
}
