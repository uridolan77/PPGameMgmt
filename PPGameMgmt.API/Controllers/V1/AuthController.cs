using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models.Responses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.API.Controllers.V1
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger = null)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AuthenticationResult>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var result = await _authService.AuthenticateAsync(request.UsernameOrEmail, request.Password, ipAddress);
                
                // Set the refresh token in a cookie
                SetRefreshTokenCookie(result.RefreshToken);
                
                return Ok(new ApiResponse<AuthenticationResult>(result)
                {
                    Message = "Authentication successful"
                });
            }
            catch (AuthenticationException ex)
            {
                _logger?.LogWarning(ex, "Authentication failed");
                return Unauthorized(new ApiResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "An error occurred during login");
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred during authentication"
                });
            }
        }
        
        [HttpPost("refresh-token")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AuthenticationResult>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new ApiResponse
                    {
                        Success = false,
                        Message = "Invalid token"
                    });
                }
                
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var result = await _authService.RefreshTokenAsync(refreshToken, ipAddress);
                
                // Set the new refresh token in a cookie
                SetRefreshTokenCookie(result.RefreshToken);
                
                return Ok(new ApiResponse<AuthenticationResult>(result)
                {
                    Message = "Token refreshed successfully"
                });
            }
            catch (AuthenticationException ex)
            {
                _logger?.LogWarning(ex, "Token refresh failed");
                return Unauthorized(new ApiResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "An error occurred during token refresh");
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred during token refresh"
                });
            }
        }
        
        [HttpPost("revoke-token")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var token = request.RefreshToken ?? Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Token is required"
                    });
                }
                
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var success = await _authService.RevokeTokenAsync(token, ipAddress);
                
                if (success)
                {
                    return Ok(new ApiResponse
                    {
                        Success = true,
                        Message = "Token revoked successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse
                    {
                        Success = false,
                        Message = "Token revocation failed"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "An error occurred during token revocation");
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred during token revocation"
                });
            }
        }
        
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse))]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                var user = await _authService.RegisterUserAsync(request);
                
                // In a real-world application, you might want to send a verification email here
                
                return Created(string.Empty, new ApiResponse
                {
                    Success = true,
                    Message = "Registration successful. Please check your email to verify your account."
                });
            }
            catch (ValidationException ex)
            {
                _logger?.LogWarning(ex, "Registration failed due to validation errors");
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = ex.Errors
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "An error occurred during registration");
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }
        
        // Helper method to set the refresh token cookie
        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7), // Should match the token expiration in the service
                SameSite = SameSiteMode.Strict,
                Secure = HttpContext.Request.IsHttps // Only set to true in production over HTTPS
            };
            
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}