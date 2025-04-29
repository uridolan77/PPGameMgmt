using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.Exceptions;

namespace PPGameMgmt.API.Middleware
{
    /// <summary>
    /// Global exception handling middleware to provide consistent error responses
    /// </summary>
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        public GlobalExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlingMiddleware> logger,
            IWebHostEnvironment environment)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Log the exception with correlation ID for traceability
                var correlationId = context.TraceIdentifier;
                _logger.LogError(ex, "An unhandled exception occurred. CorrelationId: {CorrelationId}", correlationId);

                await HandleExceptionAsync(context, ex, correlationId);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception, string correlationId)
        {
            context.Response.ContentType = "application/json";

            var statusCode = GetHttpStatusCode(exception);
            context.Response.StatusCode = (int)statusCode;

            // Add correlation ID to response headers
            context.Response.Headers.Append("X-Correlation-Id", correlationId);

            var errorResponse = new ApiErrorResponse
            {
                StatusCode = (int)statusCode,
                Message = GetUserFriendlyMessage(exception, statusCode),
                CorrelationId = correlationId,
                Errors = GetErrorDetails(exception)
            };

            // Add domain-specific error codes if available
            if (exception is DomainException domainException)
            {
                errorResponse.ErrorCode = domainException.ErrorCode;
                
                // Add validation details if available
                if (domainException is ValidationException validationEx && validationEx.Errors.Count > 0)
                {
                    errorResponse.ValidationErrors = validationEx.Errors;
                }
            }

            // Add technical details in development environment
            if (_environment.IsDevelopment())
            {
                errorResponse.DeveloperMessage = exception.Message;
                errorResponse.ExceptionType = exception.GetType().Name;
                errorResponse.StackTrace = exception.StackTrace;
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(errorResponse, options);

            await context.Response.WriteAsync(json);
        }

        private static HttpStatusCode GetHttpStatusCode(Exception exception)
        {
            // Map exception types to HTTP status codes
            return exception switch
            {
                // Domain exceptions
                EntityNotFoundException => HttpStatusCode.NotFound,
                ValidationException => HttpStatusCode.BadRequest,
                BusinessRuleViolationException => HttpStatusCode.UnprocessableEntity,
                ConcurrencyException => HttpStatusCode.Conflict,
                InfrastructureException => HttpStatusCode.ServiceUnavailable,
                DomainException => HttpStatusCode.BadRequest,
                
                // Standard exceptions
                KeyNotFoundException => HttpStatusCode.NotFound,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                ArgumentException => HttpStatusCode.BadRequest,
                ArgumentNullException => HttpStatusCode.BadRequest,
                ArgumentOutOfRangeException => HttpStatusCode.BadRequest,
                InvalidOperationException => HttpStatusCode.BadRequest,
                FormatException => HttpStatusCode.BadRequest,
                NotImplementedException => HttpStatusCode.NotImplemented,
                TimeoutException => HttpStatusCode.GatewayTimeout,
                // Default case
                _ => HttpStatusCode.InternalServerError,
            };
        }

        private static string GetUserFriendlyMessage(Exception exception, HttpStatusCode statusCode)
        {
            // Return specific messages for domain exceptions
            if (exception is DomainException)
            {
                return exception.Message;
            }
            
            // Provide user-friendly messages based on status code
            return statusCode switch
            {
                HttpStatusCode.NotFound => "The requested resource was not found.",
                HttpStatusCode.BadRequest => "The request was invalid or cannot be processed.",
                HttpStatusCode.Unauthorized => "You are not authorized to access this resource.",
                HttpStatusCode.Forbidden => "You do not have permission to access this resource.",
                HttpStatusCode.RequestTimeout => "The request timed out.",
                HttpStatusCode.Conflict => "The request could not be completed due to a conflict.",
                HttpStatusCode.Gone => "The requested resource is no longer available.",
                HttpStatusCode.UnsupportedMediaType => "The request contains an unsupported media type.",
                HttpStatusCode.TooManyRequests => "Too many requests. Please try again later.",
                HttpStatusCode.UnprocessableEntity => "The request was well-formed but could not be processed due to semantic errors.",
                HttpStatusCode.ServiceUnavailable => "The service is temporarily unavailable. Please try again later.",
                HttpStatusCode.GatewayTimeout => "The request timed out. Please try again later.",
                // Combine NotImplemented and InternalServerError into a single case
                HttpStatusCode.NotImplemented or HttpStatusCode.InternalServerError => "An unexpected error occurred. Please try again later.",
                HttpStatusCode.BadGateway => "The server received an invalid response from an upstream server.",
                // Default case
                _ => "An error occurred while processing your request."
            };
        }

        private static List<string> GetErrorDetails(Exception exception)
        {
            var errors = new List<string>();

            // Add the main exception message
            errors.Add(exception.Message);

            // Add inner exception messages if available
            var innerException = exception.InnerException;
            while (innerException != null)
            {
                errors.Add(innerException.Message);
                innerException = innerException.InnerException;
            }

            return errors;
        }
    }

    // Extension method to make it easier to add this middleware to the pipeline
    public static class GlobalExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
        }
    }
}