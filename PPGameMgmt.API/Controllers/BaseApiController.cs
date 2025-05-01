using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace PPGameMgmt.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public abstract class BaseApiController : ControllerBase
    {
        protected readonly ILogger _logger;
        private readonly Stopwatch _stopwatch;

        protected BaseApiController(ILogger logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _stopwatch = new Stopwatch();
            _stopwatch.Start();
        }
        /// <summary>
        /// Creates a successful response
        /// </summary>
        protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string? message = null)
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Success(
                data,
                message,
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogInformation(
                "Request successful: {Method} {Path} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                _stopwatch.ElapsedMilliseconds);

            return Ok(response);
        }

        /// <summary>
        /// Creates a successful paginated response
        /// </summary>
        protected ActionResult<ApiResponse<T>> OkPaginatedResponse<T>(
            T data,
            int pageNumber,
            int pageSize,
            int totalCount,
            string? message = null)
        {
            _stopwatch.Stop();

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var paginationMetadata = new PaginationMetadata
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };

            var response = ApiResponse<T>.SuccessWithPagination(
                data,
                paginationMetadata,
                message,
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogInformation(
                "Paginated request successful: {Method} {Path} - Page {PageNumber}/{TotalPages} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                pageNumber,
                totalPages,
                _stopwatch.ElapsedMilliseconds);

            return Ok(response);
        }

        /// <summary>
        /// Creates a successful paginated response with existing pagination metadata
        /// </summary>
        protected ActionResult<ApiResponse<T>> OkPaginatedResponse<T>(
            T data,
            PaginationMetadata pagination,
            string? message = null)
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.SuccessWithPagination(
                data,
                pagination,
                message,
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogInformation(
                "Paginated request successful: {Method} {Path} - Page {PageNumber}/{TotalPages} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                pagination.PageNumber,
                pagination.TotalPages,
                _stopwatch.ElapsedMilliseconds);

            return Ok(response);
        }

        /// <summary>
        /// Creates a not found response
        /// </summary>
        protected ActionResult<ApiResponse<T>> NotFoundResponse<T>(string message = "Resource not found")
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                new List<string> { "The requested resource was not found." },
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogWarning(
                "Resource not found: {Method} {Path} - {Message} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                message,
                _stopwatch.ElapsedMilliseconds);

            return NotFound(response);
        }

        /// <summary>
        /// Creates a bad request response
        /// </summary>
        protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, List<string>? errors = null)
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                errors,
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogWarning(
                "Bad request: {Method} {Path} - {Message} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                message,
                _stopwatch.ElapsedMilliseconds);

            return BadRequest(response);
        }

        /// <summary>
        /// Creates a bad request response with a single error
        /// </summary>
        protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, string error)
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                error,
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogWarning(
                "Bad request: {Method} {Path} - {Message} - {Error} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                message,
                error,
                _stopwatch.ElapsedMilliseconds);

            return BadRequest(response);
        }

        /// <summary>
        /// Creates a server error response
        /// </summary>
        protected ActionResult<ApiResponse<T>> ServerErrorResponse<T>(string message = "An unexpected error occurred")
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                new List<string> { "An unexpected error occurred on the server." },
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogError(
                "Server error: {Method} {Path} - {Message} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                message,
                _stopwatch.ElapsedMilliseconds);

            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        /// <summary>
        /// Creates an unauthorized response
        /// </summary>
        protected ActionResult<ApiResponse<T>> UnauthorizedResponse<T>(string message = "Unauthorized access")
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                new List<string> { "You are not authorized to access this resource." },
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogWarning(
                "Unauthorized access: {Method} {Path} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                _stopwatch.ElapsedMilliseconds);

            return Unauthorized(response);
        }

        /// <summary>
        /// Creates a forbidden response
        /// </summary>
        protected ActionResult<ApiResponse<T>> ForbiddenResponse<T>(string message = "Forbidden access")
        {
            _stopwatch.Stop();

            var response = ApiResponse<T>.Failure(
                message,
                new List<string> { "You do not have permission to access this resource." },
                HttpContext.TraceIdentifier);

            response.ExecutionTimeMs = _stopwatch.ElapsedMilliseconds;

            _logger.LogWarning(
                "Forbidden access: {Method} {Path} - Duration: {ElapsedMilliseconds}ms",
                HttpContext.Request.Method,
                HttpContext.Request.Path,
                _stopwatch.ElapsedMilliseconds);

            return StatusCode(StatusCodes.Status403Forbidden, response);
        }
    }
}
