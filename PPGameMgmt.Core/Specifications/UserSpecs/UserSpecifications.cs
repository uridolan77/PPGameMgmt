using System;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.UserSpecs
{
    /// <summary>
    /// Specification for retrieving a user by email
    /// </summary>
    public class UserByEmailSpecification : BaseSpecification<User>
    {
        public UserByEmailSpecification(string email)
            : base(u => u.Email.ToLower() == email.ToLower())
        {
            AddInclude(u => u.Player);
        }
    }
    
    /// <summary>
    /// Specification for retrieving a user by username
    /// </summary>
    public class UserByUsernameSpecification : BaseSpecification<User>
    {
        public UserByUsernameSpecification(string username)
            : base(u => u.Username.ToLower() == username.ToLower())
        {
            AddInclude(u => u.Player);
        }
    }
    
    /// <summary>
    /// Specification for retrieving a refresh token by token value
    /// </summary>
    public class RefreshTokenByTokenValueSpecification : BaseSpecification<RefreshToken>
    {
        public RefreshTokenByTokenValueSpecification(string token)
            : base(t => t.Token == token)
        {
            AddInclude(t => t.User);
        }
    }
}