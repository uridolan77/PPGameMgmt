using System.Collections.Generic;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Configuration model for Azure API Management integration
    /// </summary>
    public class ApiManagementConfig
    {
        /// <summary>
        /// The name of the API Management service
        /// </summary>
        public string ServiceName { get; set; } = string.Empty;

        /// <summary>
        /// The API version identifier
        /// </summary>
        public string ApiVersion { get; set; } = "v1";

        /// <summary>
        /// The API name registered in API Management
        /// </summary>
        public string ApiName { get; set; } = "pp-gamemgmt-api";

        /// <summary>
        /// Subscription key header name
        /// </summary>
        public string SubscriptionKeyHeaderName { get; set; } = "Ocp-Apim-Subscription-Key";

        /// <summary>
        /// Trace header name for request tracking
        /// </summary>
        public string TraceHeaderName { get; set; } = "Ocp-Apim-Trace";

        /// <summary>
        /// Whether to require subscription keys for API calls
        /// </summary>
        public bool RequireSubscriptionKey { get; set; } = true;

        /// <summary>
        /// List of API paths that don't require a subscription key
        /// Format: "/api/controller" or "/api/controller/action"
        /// </summary>
        public List<string> ExemptPaths { get; set; } = new List<string>();
    }
}