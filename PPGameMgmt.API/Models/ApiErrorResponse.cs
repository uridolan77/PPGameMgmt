using System.Collections.Generic;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Standard error response model for API endpoints
    /// </summary>
    public class ApiErrorResponse
    {
        /// <summary>
        /// HTTP status code
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// User-friendly error message
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Correlation ID for tracking the request
        /// </summary>
        public string CorrelationId { get; set; }

        /// <summary>
        /// Error code for domain-specific errors
        /// </summary>
        public string ErrorCode { get; set; }

        /// <summary>
        /// List of detailed error messages
        /// </summary>
        public List<string> Errors { get; set; } = new List<string>();

        /// <summary>
        /// Validation errors with property names
        /// </summary>
        public IDictionary<string, string[]> ValidationErrors { get; set; }

        /// <summary>
        /// Technical error message (only included in development environment)
        /// </summary>
        public string DeveloperMessage { get; set; }

        /// <summary>
        /// Exception type (only included in development environment)
        /// </summary>
        public string ExceptionType { get; set; }

        /// <summary>
        /// Stack trace (only included in development environment)
        /// </summary>
        public string StackTrace { get; set; }
    }
}
