using System.Collections.Generic;

namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Standard API response envelope for all API endpoints
    /// </summary>
    /// <typeparam name="T">Type of data being returned</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// Indicates if the request was successful
        /// </summary>
        public bool IsSuccess { get; set; }
        
        /// <summary>
        /// Optional message providing additional information about the response
        /// </summary>
        public string? Message { get; set; }
        
        /// <summary>
        /// The data payload of the response
        /// </summary>
        public T? Data { get; set; }
        
        /// <summary>
        /// List of errors that occurred during request processing
        /// </summary>
        public List<string> Errors { get; set; } = new List<string>();
        
        /// <summary>
        /// Pagination metadata if the response is paginated
        /// </summary>
        public PaginationMetadata? Pagination { get; set; }
        
        /// <summary>
        /// Creates a successful response with data
        /// </summary>
        public static ApiResponse<T> Success(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                Message = message,
                Data = data
            };
        }
        
        /// <summary>
        /// Creates a successful paginated response with data
        /// </summary>
        public static ApiResponse<T> SuccessWithPagination(T data, PaginationMetadata pagination, string? message = null)
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                Message = message,
                Data = data,
                Pagination = pagination
            };
        }
        
        /// <summary>
        /// Creates a failed response with errors
        /// </summary>
        public static ApiResponse<T> Failure(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
        
        /// <summary>
        /// Creates a failed response with a single error
        /// </summary>
        public static ApiResponse<T> Failure(string message, string error)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Message = message,
                Errors = new List<string> { error }
            };
        }
    }
}
