using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Specifications.UserSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        // Using the DbSet for RefreshTokens that's not covered by the base Repository<User>
        private readonly DbSet<RefreshToken> _refreshTokens;
        private const string _refreshTokenEntityName = "RefreshToken";

        public UserRepository(CasinoDbContext context, ILogger<UserRepository> logger = null)
            : base(context, logger)
        {
            _refreshTokens = context.Set<RefreshToken>();
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting user with email: {email}");
                    var specification = new UserByEmailSpecification(email);
                    return await _dbSet
                        .Where(specification.ToExpression())
                        .Include(u => u.Player)
                        .FirstOrDefaultAsync();
                },
                $"Error retrieving user with email: {email}"
            );
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting user with username: {username}");
                    var specification = new UserByUsernameSpecification(username);
                    return await _dbSet
                        .Where(specification.ToExpression())
                        .Include(u => u.Player)
                        .FirstOrDefaultAsync();
                },
                $"Error retrieving user with username: {username}"
            );
        }

        public override async Task<User> GetByIdAsync(string id)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting user with ID: {id}");
                    return await _dbSet
                        .Include(u => u.Player)
                        .FirstOrDefaultAsync(u => u.Id == id);
                },
                $"Error retrieving user with ID: {id}"
            );
        }

        public async Task<User> CreateAsync(User user)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    if (user == null) throw new ArgumentNullException(nameof(user));
                    
                    _logger?.LogDebug("Creating new user");
                    
                    if (string.IsNullOrEmpty(user.Id))
                    {
                        user.Id = Guid.NewGuid().ToString();
                    }

                    user.CreatedAt = DateTime.UtcNow;
                    user.UpdatedAt = DateTime.UtcNow;

                    await _dbSet.AddAsync(user);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogDebug($"Created new user with ID: {user.Id}");
                    
                    return user;
                },
                "Error creating user"
            );
        }

        public override async Task UpdateAsync(User user)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    if (user == null) throw new ArgumentNullException(nameof(user));
                    
                    _logger?.LogDebug($"Updating user with ID: {user.Id}");

                    var existingUser = await _dbSet.FindAsync(user.Id);
                    if (existingUser == null)
                        throw new EntityNotFoundException(_entityName, user.Id);

                    user.UpdatedAt = DateTime.UtcNow;
                    _context.Entry(existingUser).CurrentValues.SetValues(user);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogDebug($"Updated user with ID: {user.Id}");
                    
                    return true;
                },
                $"Error updating user with ID: {user?.Id}"
            );
        }

        // RefreshToken operations - these use the base Repository's ExecuteRepositoryOperationAsync method
        // but operate on RefreshToken entities instead of User entities

        public async Task<RefreshToken> CreateRefreshTokenAsync(RefreshToken token)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    if (token == null) throw new ArgumentNullException(nameof(token));
                    
                    _logger?.LogDebug("Creating new refresh token");

                    if (string.IsNullOrEmpty(token.Id))
                    {
                        token.Id = Guid.NewGuid().ToString();
                    }

                    token.CreatedAt = DateTime.UtcNow;

                    await _refreshTokens.AddAsync(token);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogDebug($"Created new refresh token with ID: {token.Id}");
                    
                    return token;
                },
                "Error creating refresh token"
            );
        }

        public async Task<RefreshToken> GetRefreshTokenAsync(string token)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting refresh token: {token}");
                    var specification = new RefreshTokenByTokenValueSpecification(token);
                    return await _refreshTokens
                        .Where(specification.ToExpression())
                        .Include(t => t.User)
                        .FirstOrDefaultAsync();
                },
                $"Error retrieving refresh token: {token}"
            );
        }

        public async Task UpdateRefreshTokenAsync(RefreshToken token)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    if (token == null) throw new ArgumentNullException(nameof(token));
                    
                    _logger?.LogDebug($"Updating refresh token with ID: {token.Id}");

                    var existingToken = await _refreshTokens.FindAsync(token.Id);
                    if (existingToken == null)
                        throw new EntityNotFoundException(_refreshTokenEntityName, token.Id);

                    _context.Entry(existingToken).CurrentValues.SetValues(token);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogDebug($"Updated refresh token with ID: {token.Id}");
                    
                    return true;
                },
                $"Error updating refresh token with ID: {token?.Id}"
            );
        }

        public async Task<bool> RevokeTokenAsync(string token, string ipAddress, string replacementToken = null)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Revoking refresh token: {token}");
                    
                    var refreshToken = await _refreshTokens.FirstOrDefaultAsync(r => r.Token == token);
                    
                    if (refreshToken == null) return false;

                    // Revoke token and save
                    refreshToken.Revoked = true;
                    refreshToken.ReplacedByToken = replacementToken;

                    _refreshTokens.Update(refreshToken);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogDebug($"Revoked refresh token: {token}");
                    
                    return true;
                },
                $"Error revoking refresh token: {token}"
            );
        }
    }
}