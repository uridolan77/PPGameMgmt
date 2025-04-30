using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PPGameMgmt.API.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;

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

            // Get execution time from HttpContext if available
            long executionTimeMs = 0;
            if (context.HttpContext.Items.TryGetValue("RequestStopwatch", out var stopwatchObj) &&
                stopwatchObj is Stopwatch stopwatch)
            {
                executionTimeMs = stopwatch.ElapsedMilliseconds;
            }

            // Skip if the result is already a standard ApiResponse
            // For example, when a controller action returns OkResponse(), BadRequestResponse(), etc.
            if (IsApiResponseResult(context.Result))
            {
                // If it's already an ApiResponse, we still want to add the execution time
                if (context.Result is ObjectResult objectResult && objectResult.Value != null)
                {
                    var valueType = objectResult.Value.GetType();
                    if (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(ApiResponse<>))
                    {
                        // Set the execution time using reflection
                        var executionTimeProperty = valueType.GetProperty("ExecutionTimeMs");
                        executionTimeProperty?.SetValue(objectResult.Value, executionTimeMs);
                    }
                }
                return;
            }

            // Handle different result types
            switch (context.Result)
            {
                // Handle ObjectResult (including OkObjectResult, BadRequestObjectResult, etc.)
                case ObjectResult objectResult:
                    // Create standard response
                    var statusCode = objectResult.StatusCode ?? 200;

                    // Process all response types, including null, primitive types, and strings
                    var responseObj = objectResult.Value;
                    var apiResponse = CreateApiResponse(responseObj, statusCode);

                    // Set execution time using reflection
                    var apiResponseType = apiResponse.GetType();
                    var executionTimeProperty = apiResponseType.GetProperty("ExecutionTimeMs");
                    executionTimeProperty?.SetValue(apiResponse, executionTimeMs);

                    objectResult.Value = apiResponse;
                    break;

                // Handle StatusCodeResult (including OkResult, NotFoundResult, etc.)
                case StatusCodeResult statusCodeResult:
                    var statusMessage = GetDefaultMessageForStatusCode(statusCodeResult.StatusCode);
                    // Create a response with null data
                    var emptyApiResponse = new ApiResponse<object>
                    {
                        IsSuccess = statusCodeResult.StatusCode >= 200 && statusCodeResult.StatusCode < 400,
                        Message = statusMessage,
                        Data = null,
                        ExecutionTimeMs = executionTimeMs
                    };

                    context.Result = new ObjectResult(emptyApiResponse)
                    {
                        StatusCode = statusCodeResult.StatusCode
                    };
                    break;
            }
        }

        /// <summary>
        /// Creates an ApiResponse object based on the status code and content
        /// </summary>
        private static object CreateApiResponse(object? content, int statusCode)
        {
            // Create a properly typed ApiResponse using reflection
            var contentType = content?.GetType() ?? typeof(object);
            var message = GetDefaultMessageForStatusCode(statusCode);

            // Create a generic ApiResponse type based on the content type
            var apiResponseType = typeof(ApiResponse<>).MakeGenericType(contentType);

            // Create a new instance of the ApiResponse
            var response = Activator.CreateInstance(apiResponseType);
            if (response == null)
            {
                // Fallback to object if we can't create the specific type
                var fallbackResponse = new ApiResponse<object>
                {
                    IsSuccess = statusCode >= 200 && statusCode < 400,
                    Message = message,
                    Data = content
                };

                if (statusCode >= 400)
                {
                    fallbackResponse.Errors.Add(message);
                }

                return fallbackResponse;
            }

            // Set the properties based on the status code
            var isSuccessProperty = apiResponseType.GetProperty("IsSuccess");
            var messageProperty = apiResponseType.GetProperty("Message");
            var dataProperty = apiResponseType.GetProperty("Data");
            var errorsProperty = apiResponseType.GetProperty("Errors");

            bool isSuccess = statusCode >= 200 && statusCode < 400;
            isSuccessProperty?.SetValue(response, isSuccess);
            messageProperty?.SetValue(response, message);

            if (isSuccess)
            {
                // For success responses, set the data
                dataProperty?.SetValue(response, content);
            }
            else
            {
                // For error responses, set the errors
                if (errorsProperty?.GetValue(response) is List<string> errors)
                {
                    errors.Add(message);
                }
                else
                {
                    errorsProperty?.SetValue(response, new List<string> { message });
                }
            }

            return response;
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