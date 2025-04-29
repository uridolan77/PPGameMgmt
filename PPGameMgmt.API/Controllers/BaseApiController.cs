using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PPGameMgmt.API.Models;
using System.Collections.Generic;

namespace PPGameMgmt.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        /// <summary>
        /// Creates a successful response
        /// </summary>
        protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string message = null)
        {
            var response = ApiResponse<T>.Success(data, message);
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
            string message = null)
        {
            var totalPages = (int)System.Math.Ceiling(totalCount / (double)pageSize);
            
            var paginationMetadata = new PaginationMetadata
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
            
            var response = ApiResponse<T>.SuccessWithPagination(data, paginationMetadata, message);
            return Ok(response);
        }
        
        /// <summary>
        /// Creates a not found response
        /// </summary>
        protected ActionResult<ApiResponse<T>> NotFoundResponse<T>(string message = "Resource not found")
        {
            var response = ApiResponse<T>.Failure(message);
            return NotFound(response);
        }
        
        /// <summary>
        /// Creates a bad request response
        /// </summary>
        protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, List<string> errors = null)
        {
            var response = ApiResponse<T>.Failure(message, errors);
            return BadRequest(response);
        }
        
        /// <summary>
        /// Creates a bad request response with a single error
        /// </summary>
        protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, string error)
        {
            var response = ApiResponse<T>.Failure(message, error);
            return BadRequest(response);
        }
        
        /// <summary>
        /// Creates a server error response
        /// </summary>
        protected ActionResult<ApiResponse<T>> ServerErrorResponse<T>(string message = "An unexpected error occurred")
        {
            var response = ApiResponse<T>.Failure(message);
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }
}
