using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models.Auth;

namespace PPGameMgmt.Infrastructure.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _jwtSettings;
        
        public JwtService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public string GenerateJwtToken(User user)
        {
            var claims = GetClaimsFromUser(user);
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = GetJwtExpirationTime(),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                ),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public DateTime GetJwtExpirationTime()
        {
            return DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        }

        public DateTime GetRefreshTokenExpirationTime()
        {
            return DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        }

        public string? ValidateJwtToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = jwtToken.Claims.First(x => x.Type == ClaimTypes.NameIdentifier).Value;

                return userId;
            }
            catch
            {
                return null;
            }
        }

        public ClaimsPrincipal? GetPrincipalFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false, // We don't validate lifetime here since we want to validate expired tokens too
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                if (!(validatedToken is JwtSecurityToken jwtSecurityToken) || 
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }

        public IEnumerable<Claim> GetClaimsFromUser(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FirstName", user.FirstName ?? string.Empty),
                new Claim("LastName", user.LastName ?? string.Empty)
            };

            if (!string.IsNullOrEmpty(user.PlayerId))
            {
                claims.Add(new Claim("PlayerId", user.PlayerId));
            }

            return claims;
        }
    }
}