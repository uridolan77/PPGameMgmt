using System;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthenticationResult> AuthenticateAsync(string usernameOrEmail, string password, string ipAddress);
        Task<AuthenticationResult> RefreshTokenAsync(string token, string ipAddress);
        Task<bool> RevokeTokenAsync(string token, string ipAddress);
        Task<User> RegisterUserAsync(RegisterUserRequest model);
        Task<bool> ValidateResetTokenAsync(string token);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string password);
        Task<User> VerifyEmailAsync(string token);
    }
}