using System;
using System.Security.Cryptography;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.Services
{
    public class PasswordService : IPasswordService
    {
        public void CreatePasswordHash(string password, out string passwordHash, out string passwordSalt)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be empty or whitespace only", nameof(password));

            using var hmac = new HMACSHA512();
            passwordSalt = Convert.ToBase64String(hmac.Key);
            passwordHash = Convert.ToBase64String(hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password)));
        }

        public bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be empty or whitespace only", nameof(password));
            
            if (string.IsNullOrWhiteSpace(storedHash))
                throw new ArgumentException("Invalid password hash", nameof(storedHash));
            
            if (string.IsNullOrWhiteSpace(storedSalt))
                throw new ArgumentException("Invalid password salt", nameof(storedSalt));
            
            var saltBytes = Convert.FromBase64String(storedSalt);
            var hashBytes = Convert.FromBase64String(storedHash);
            
            using var hmac = new HMACSHA512(saltBytes);
            var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            
            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != hashBytes[i])
                    return false;
            }
            
            return true;
        }
    }
}