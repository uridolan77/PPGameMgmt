using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PPGameMgmt.API.Models;

namespace PPGameMgmt.API.Filters
{
    /// <summary>
    /// Action filter to ensure all API responses follow the standard ApiResponse format
    /// </summary>
    public class StandardApiResponseFilter : IActionFilter
    {
        /// <summary>
        /// Executes before the action method
        /// </summary>
        public void OnActionExecuting(ActionExecutingContext context)
        {
            // No preprocessing needed
        }

        /// <summary>
        /// Executes after the action method, wrapping the result in a standard ApiResponse if not already wrapped
        /// </summary>
        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Don't process if there's an exception or if result is null
            if (context.Exception != null || context.Result == null)
            {
                return;
            }

            // Skip if the result is already a standard ApiResponse
            // For example, when a controller action returns OkResponse(), BadRequestResponse(), etc.
            if (IsApiResponseResult(context.Result))
            {
                return;
            }

            // Handle different result types
            switch (context.Result)
            {
                // Handle ObjectResult (including OkObjectResult, BadRequestObjectResult, etc.)
                case ObjectResult objectResult:
                    // Create standard response
                    var statusCode = objectResult.StatusCode ?? 200;
                    var responseType = objectResult.Value?.GetType();

                    // Skip void and primitive types
                    if (responseType != null && !responseType.IsPrimitive && responseType != typeof(string))
                    {
                        var responseObj = objectResult.Value;
                        objectResult.Value = CreateApiResponse(responseObj, statusCode);
                    }
                    break;

                // Handle StatusCodeResult (including OkResult, NotFoundResult, etc.)
                case StatusCodeResult statusCodeResult:
                    var message = GetDefaultMessageForStatusCode(statusCodeResult.StatusCode);
                    context.Result = new ObjectResult(ApiResponse<object>.Success(null, message))
                    {
                        StatusCode = statusCodeResult.StatusCode
                    };
                    break;
            }
        }

        /// <summary>
        /// Creates an ApiResponse object based on the status code and content
        /// </summary>
        private static object CreateApiResponse(object content, int statusCode)
        {
            // Create a properly typed ApiResponse using reflection
            var contentType = content?.GetType() ?? typeof(object);
            var message = GetDefaultMessageForStatusCode(statusCode);
            
            var apiResponseType = typeof(ApiResponse<>).MakeGenericType(contentType);
            
            if (statusCode >= 200 && statusCode < 400)
            {
                // Success response
                return Activator.CreateInstance(apiResponseType, true, message, content, null)!;
            }
            else
            {
                // Error response
                return Activator.CreateInstance(apiResponseType, false, message, default, new List<string> { message })!;
            }
        }

        /// <summary>
        /// Checks if the result is already a wrapped ApiResponse
        /// </summary>
        private static bool IsApiResponseResult(IActionResult result)
        {
            // Check if this is already an API response type result
            if (result is ObjectResult objectResult && objectResult.Value != null)
            {
                var valueType = objectResult.Value.GetType();
                return valueType.IsGenericType && 
                       valueType.GetGenericTypeDefinition() == typeof(ApiResponse<>);
            }

            return false;
        }

        /// <summary>
        /// Gets a default message for the given HTTP status code
        /// </summary>
        private static string GetDefaultMessageForStatusCode(int statusCode)
        {
            return statusCode switch
            {
                200 => "Request successful.",
                201 => "Resource created successfully.",
                202 => "Request accepted for processing.",
                204 => "Request successful, no content to return.",
                400 => "Bad request.",
                401 => "Unauthorized access.",
                403 => "Forbidden access.",
                404 => "Resource not found.",
                409 => "Conflict detected.",
                422 => "Validation failed.",
                500 => "An error occurred while processing your request.",
                _ => "Request processed."
            };
        }
    }
}