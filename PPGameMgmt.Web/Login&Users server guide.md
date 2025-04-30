
````
using FluentValidation;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.API.Validators.Auth
{
    public class AuthRequestValidator : AbstractValidator<AuthRequest>
    {
        public AuthRequestValidator()
        {
            RuleFor(x => x.UsernameOrEmail)
                .NotEmpty().WithMessage("Username or email is required")
                .MaximumLength(100).WithMessage("Username or email cannot exceed 100 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long");
        }
    }
}
````


Made changes.

Let's continue implementing the user authentication system. We now need to create validators for the registration and token requests.
````
using FluentValidation;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.API.Validators.Auth
{
    public class RegisterUserRequestValidator : AbstractValidator<RegisterUserRequest>
    {
        public RegisterUserRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters long")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
                .Matches("^[a-zA-Z0-9_.]+$").WithMessage("Username can only contain letters, numbers, underscores and periods");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("A valid email address is required")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");

            RuleFor(x => x.FirstName)
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters");

            RuleFor(x => x.LastName)
                .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters");
        }
    }
}
````


Made changes.

Let's continue by creating a validator for refresh token requests:
````
using FluentValidation;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.API.Validators.Auth
{
    public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
    {
        public RefreshTokenRequestValidator()
        {
            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("Refresh token is required");
        }
    }
}
````


Made changes.

Let's continue by creating the last missing piece - the AuthenticationResult class that is used to return data after successful login or token refresh:
````
using System;

namespace PPGameMgmt.Core.Models.Auth
{
    public class AuthenticationResult
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpires { get; set; }
        public bool IsEmailVerified { get; set; }
    }
}
````


Made changes.

We now have all the necessary components for our user authentication system implemented. Let's create a user management controller to provide additional user-related functionality like viewing current user information, updating profiles, etc.
````
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models.Responses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers.V1
{
    [ApiController]
    [Route("api/v1/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserRepository userRepository,
            IJwtService jwtService,
            ILogger<UsersController> logger = null)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _logger = logger;
        }

        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    IsEmailVerified = user.IsEmailVerified,
                    CreatedAt = user.CreatedAt,
                    LastLoginDate = user.LastLoginDate,
                    PlayerId = user.PlayerId
                };

                return Ok(new ApiResponse<UserDto>(userDto)
                {
                    Success = true,
                    Message = "User retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving current user");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while retrieving the user"
                });
            }
        }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string PlayerId { get; set; }
    }
}
````


Made changes.

Let's move the UserDto to a dedicated file in our Models directory to maintain a clean separation of concerns in our API project:I've examined the Models/DTOs directory and found that it already contains DTOs for other entities like BonusDto, GameDto, and PlayerDto. Let's create a UserDto in this directory to maintain consistency:
````
using System;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for User entity
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// User's unique identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// User's username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// User's role
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// Whether the user account is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Whether the user's email is verified
        /// </summary>
        public bool IsEmailVerified { get; set; }

        /// <summary>
        /// Date the user account was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date of the user's last login
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// The ID of the player associated with this user (if any)
        /// </summary>
        public string PlayerId { get; set; }
    }
}
````


Made changes.

Now I need to update the UsersController to use the newly created UserDto in the dedicated DTOs directory. Let's update the UsersController to reference the proper UserDto class and remove the inline version:
````
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models.DTOs;
using PPGameMgmt.API.Models.Responses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers.V1
{
    [ApiController]
    [Route("api/v1/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserRepository userRepository,
            IJwtService jwtService,
            ILogger<UsersController> logger = null)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _logger = logger;
        }

        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    IsEmailVerified = user.IsEmailVerified,
                    CreatedAt = user.CreatedAt,
                    LastLoginDate = user.LastLoginDate,
                    PlayerId = user.PlayerId
                };

                return Ok(new ApiResponse<UserDto>(userDto)
                {
                    Success = true,
                    Message = "User retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving current user");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while retrieving the user"
                });
            }
        }
    }
}
````


Made changes.

Let's finish our implementation by adding a mapping profile for users in AutoMapper. This will help us cleanly map between our domain entities and DTOs.Let's continue by adding the User entity mapping to our AutoMapper profile:
````
            // Bonus mappings
            CreateMap<Bonus, BonusDto>();
            CreateMap<BonusDto, Bonus>();
            
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.VerificationToken, opt => opt.Ignore())
                .ForMember(dest => dest.ResetPasswordToken, opt => opt.Ignore())
                .ForMember(dest => dest.ResetPasswordExpires, opt => opt.Ignore());
````


Made changes.

Now let's update the UsersController to use AutoMapper for mapping between our User entity and UserDto. This will make our code cleaner and more maintainable.
````
using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models.DTOs;
using PPGameMgmt.API.Models.Responses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers.V1
{
    [ApiController]
    [Route("api/v1/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IMapper _mapper;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserRepository userRepository,
            IJwtService jwtService,
            IMapper mapper,
            ILogger<UsersController> logger = null)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger;
        }

        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var userDto = _mapper.Map<UserDto>(user);

                return Ok(new ApiResponse<UserDto>(userDto)
                {
                    Success = true,
                    Message = "User retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving current user");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while retrieving the user"
                });
            }
        }
    }
}
````


Made changes.

Let's add one more controller method to the UsersController to allow updating the user's profile information. This will provide additional functionality for users to manage their account details.
````
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> GetCurrentUser()
        {
            // ...existing code...
        }

        [HttpPut("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<UserDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ApiResponse))]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                // Update user properties
                user.FirstName = request.FirstName ?? user.FirstName;
                user.LastName = request.LastName ?? user.LastName;
                user.UpdatedAt = DateTime.UtcNow;
                
                // Save changes
                await _userRepository.UpdateAsync(user);
                
                // Return updated user
                var userDto = _mapper.Map<UserDto>(user);
                
                return Ok(new ApiResponse<UserDto>(userDto)
                {
                    Success = true,
                    Message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating user profile");
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse
                {
                    Success = false,
                    Message = "An error occurred while updating the profile"
                });
            }
        }
````


Made changes.

Let's create the `UpdateProfileRequest` model that's used in the `UpdateProfile` method we just implemented. This will define the structure for the profile update request.
````
using System.ComponentModel.DataAnnotations;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Model for updating a user's profile information
    /// </summary>
    public class UpdateProfileRequest
    {
        /// <summary>
        /// User's first name
        /// </summary>
        [StringLength(50)]
        public string FirstName { get; set; }

        /// <summary>
        /// User's last name
        /// </summary>
        [StringLength(50)]
        public string LastName { get; set; }
    }
}
````


Made changes.

Let's finish by adding a validator for the UpdateProfileRequest to ensure proper input validation:
````
using FluentValidation;
using PPGameMgmt.API.Models.DTOs;

namespace PPGameMgmt.API.Validators.Users
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileRequestValidator()
        {
            RuleFor(x => x.FirstName)
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters");

            RuleFor(x => x.LastName)
                .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters");
        }
    }
}
````


Made changes.

We've now completed the implementation of a comprehensive user authentication system for the PPGameMgmt application. Let's summarize what we've accomplished:

## Key Components Implemented

1. **Entities**:
   - `User` - Core entity for user authentication
   - `RefreshToken` - For handling JWT refresh token functionality

2. **Repositories**:
   - `IUserRepository` interface and implementation for managing user data

3. **Authentication Services**:
   - `IAuthService` and implementation for authentication logic
   - `IJwtService` and implementation for JWT token management
   - `IPasswordService` and implementation for secure password handling

4. **Controllers**:
   - `AuthController` - Handles login, token refresh, registration
   - `UsersController` - Manages user profile operations

5. **Models and DTOs**:
   - Authentication request/response models
   - User DTO for data transfer
   - API response classes for consistent endpoint responses

6. **Validators**:
   - Validation for auth requests
   - Validation for user profile updates

7. **Configuration**:
   - JWT settings in appsettings.json
   - Service registration in Program.cs

## Authentication Flow

The system supports industry-standard authentication flows:

1. **Registration** - Users can create accounts with secure password hashing
2. **Login** - Authentication with username/email and password
3. **JWT Authentication** - Secure access tokens with limited validity
4. **Token Refresh** - Mechanism to obtain new tokens without re-authentication
5. **Profile Management** - Users can view and update their profile information

## Security Features

- Password hashing with salt using HMACSHA512
- JWT tokens with proper expiration
- Refresh token rotation for enhanced security
- HTTP-only cookies for refresh tokens
- Input validation with FluentValidation

This implementation provides a solid foundation for user authentication and account management in your application. The system is designed to be secure, maintainable, and follows modern best practices for authentication.

If you want to enhance this further, you could consider:

1. Adding email verification functionality
2. Implementing password reset functionality
3. Adding role-based authorization controls
4. Adding social login options (Google, Microsoft, etc.)
5. Implementing multi-factor authentication

Would you like me to implement any of these additional features or explain anything about the current implementation in more detail?