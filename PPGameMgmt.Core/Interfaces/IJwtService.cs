using System;
using System.Collections.Generic;
using System.Security.Claims;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IJwtService
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
        DateTime GetJwtExpirationTime();
        DateTime GetRefreshTokenExpirationTime();
        string? ValidateJwtToken(string token);
        ClaimsPrincipal? GetPrincipalFromToken(string token);
        IEnumerable<Claim> GetClaimsFromUser(User user);
    }
}