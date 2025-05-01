using System;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.UserSpecs
{
    /// <summary>
    /// Specification for retrieving a user by email
    /// </summary>
    public class UserByEmailSpecification : BaseSpecification<User>
    {
        public UserByEmailSpecification(string email)
            : base(u => u.Email == email)
        {
        }
    }

    /// <summary>
    /// Specification for retrieving a user by username
    /// </summary>
    public class UserByUsernameSpecification : BaseSpecification<User>
    {
        public UserByUsernameSpecification(string username)
            : base(u => u.Username == username)
        {
        }
    }

    /// <summary>
    /// Specification for retrieving a user with a specific refresh token
    /// </summary>
    public class UserWithRefreshTokenSpecification : BaseSpecification<User>
    {
        public UserWithRefreshTokenSpecification(string refreshToken)
            : base(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken && rt.IsActive))
        {
            AddInclude("RefreshTokens");
        }
    }

    /// <summary>
    /// Specification for retrieving active users
    /// </summary>
    public class ActiveUsersSpecification : BaseSpecification<User>
    {
        public ActiveUsersSpecification()
            : base(u => u.IsActive)
        {
            ApplyOrderBy(u => u.Username);
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