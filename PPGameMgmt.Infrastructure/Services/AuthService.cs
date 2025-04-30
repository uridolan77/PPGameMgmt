using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IPasswordService passwordService,
            IJwtService jwtService,
            ILogger<AuthService> logger = null)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
            _logger = logger;
        }

        public async Task<AuthenticationResult> AuthenticateAsync(string usernameOrEmail, string password, string ipAddress)
        {
            User user = null;

            // Try to find user by email first
            if (usernameOrEmail.Contains('@'))
            {
                user = await _userRepository.GetByEmailAsync(usernameOrEmail);
            }
            
            // If not found, try by username
            if (user == null)
            {
                user = await _userRepository.GetByUsernameAsync(usernameOrEmail);
            }

            // If still not found, authentication fails
            if (user == null)
            {
                _logger?.LogWarning("Authentication failed: User {UsernameOrEmail} not found", usernameOrEmail);
                throw new AuthenticationException("Invalid username/email or password");
            }

            // Verify the password
            if (!_passwordService.VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            {
                _logger?.LogWarning("Authentication failed: Invalid password for user {Username}", user.Username);
                throw new AuthenticationException("Invalid username/email or password");
            }

            // If user account is inactive
            if (!user.IsActive)
            {
                _logger?.LogWarning("Authentication failed: User {Username} is inactive", user.Username);
                throw new AuthenticationException("This account has been deactivated");
            }

            // Authentication successful - generate tokens
            var jwtToken = _jwtService.GenerateJwtToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpires = _jwtService.GetJwtExpirationTime();
            var refreshTokenExpires = _jwtService.GetRefreshTokenExpirationTime();

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                Expires = refreshTokenExpires,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateRefreshTokenAsync(refreshTokenEntity);

            // Update last login date
            user.LastLoginDate = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Return authentication result
            return new AuthenticationResult
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Token = jwtToken,
                RefreshToken = refreshToken,
                TokenExpires = tokenExpires,
                IsEmailVerified = user.IsEmailVerified
            };
        }

        public async Task<AuthenticationResult> RefreshTokenAsync(string token, string ipAddress)
        {
            var refreshToken = await _userRepository.GetRefreshTokenAsync(token);
            if (refreshToken == null)
            {
                _logger?.LogWarning("Token refresh failed: Refresh token not found");
                throw new AuthenticationException("Invalid token");
            }

            var user = refreshToken.User;
            if (user == null)
            {
                _logger?.LogWarning("Token refresh failed: User not found for refresh token");
                throw new AuthenticationException("Invalid token");
            }

            // Check if the token is still valid
            if (!refreshToken.IsActive)
            {
                _logger?.LogWarning("Token refresh failed: Refresh token is inactive for user {Username}", user.Username);
                throw new AuthenticationException("Invalid token");
            }

            // Revoke the current refresh token
            await _userRepository.RevokeTokenAsync(token, ipAddress, null);
            
            // Generate new tokens
            var newJwtToken = _jwtService.GenerateJwtToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpires = _jwtService.GetJwtExpirationTime();
            var refreshTokenExpires = _jwtService.GetRefreshTokenExpirationTime();

            // Save the new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                Expires = refreshTokenExpires,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateRefreshTokenAsync(newRefreshTokenEntity);

            // Return authentication result
            return new AuthenticationResult
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Token = newJwtToken,
                RefreshToken = newRefreshToken,
                TokenExpires = tokenExpires,
                IsEmailVerified = user.IsEmailVerified
            };
        }

        public async Task<bool> RevokeTokenAsync(string token, string ipAddress)
        {
            return await _userRepository.RevokeTokenAsync(token, ipAddress);
        }

        public async Task<User> RegisterUserAsync(RegisterUserRequest model)
        {
            // Check if username is already taken
            var existingUserByUsername = await _userRepository.GetByUsernameAsync(model.Username);
            if (existingUserByUsername != null)
            {
                _logger?.LogWarning("User registration failed: Username {Username} already taken", model.Username);
                throw new ValidationException("Username", "Username is already taken");
            }

            // Check if email is already registered
            var existingUserByEmail = await _userRepository.GetByEmailAsync(model.Email);
            if (existingUserByEmail != null)
            {
                _logger?.LogWarning("User registration failed: Email {Email} already registered", model.Email);
                throw new ValidationException("Email", "Email address is already registered");
            }

            // Create password hash
            _passwordService.CreatePasswordHash(model.Password, out string passwordHash, out string passwordSalt);

            // Create user
            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                FirstName = model.FirstName,
                LastName = model.LastName,
                VerificationToken = Guid.NewGuid().ToString("N"),
                PlayerId = model.PlayerId,
                Role = "User", // Default role
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Save user
            var createdUser = await _userRepository.CreateAsync(user);
            _logger?.LogInformation("User registered successfully: {Username}", user.Username);

            return createdUser;
        }

        public async Task<bool> ValidateResetTokenAsync(string token)
        {
            // This would typically check if the token exists in the database and is not expired
            // For simplicity, we'll implement this as a placeholder
            return !string.IsNullOrEmpty(token);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that the user doesn't exist
                return;
            }

            // Generate reset token
            user.ResetPasswordToken = Guid.NewGuid().ToString("N");
            user.ResetPasswordExpires = DateTime.UtcNow.AddHours(24);
            await _userRepository.UpdateAsync(user);

            // In a real implementation, you would send an email with the reset token
            _logger?.LogInformation("Password reset requested for {Email}", email);
        }

        public async Task ResetPasswordAsync(string token, string password)
        {
            // This would typically verify the token and reset the password
            // For simplicity, we'll implement this as a placeholder
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Token and password are required");
            }
            
            // In a real implementation, find the user with this token and update their password
        }

        public async Task<User> VerifyEmailAsync(string token)
        {
            // This would typically verify the email by checking the verification token
            // For simplicity, we'll implement this as a placeholder
            if (string.IsNullOrEmpty(token))
            {
                throw new ArgumentException("Token is required");
            }
            
            // In a real implementation, find the user with this token and mark their email as verified
            return null;
        }
    }
}