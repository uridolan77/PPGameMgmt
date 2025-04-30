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