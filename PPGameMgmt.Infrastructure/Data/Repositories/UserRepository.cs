using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly CasinoDbContext _context;
        private readonly ILogger<UserRepository> _logger;

        public UserRepository(CasinoDbContext context, ILogger<UserRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<User> GetByIdAsync(string id)
        {
            return await _context.Users
                .Include(u => u.Player)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Player)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Player)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<User> CreateAsync(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrEmpty(user.Id))
            {
                user.Id = Guid.NewGuid().ToString();
            }

            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task UpdateAsync(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null)
                throw new EntityNotFoundException(nameof(User), user.Id);

            user.UpdatedAt = DateTime.UtcNow;
            _context.Entry(existingUser).CurrentValues.SetValues(user);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken> CreateRefreshTokenAsync(RefreshToken token)
        {
            if (token == null) throw new ArgumentNullException(nameof(token));

            if (string.IsNullOrEmpty(token.Id))
            {
                token.Id = Guid.NewGuid().ToString();
            }

            token.CreatedAt = DateTime.UtcNow;

            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<RefreshToken> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task UpdateRefreshTokenAsync(RefreshToken token)
        {
            if (token == null) throw new ArgumentNullException(nameof(token));

            var existingToken = await _context.RefreshTokens.FindAsync(token.Id);
            if (existingToken == null)
                throw new EntityNotFoundException(nameof(RefreshToken), token.Id);

            _context.Entry(existingToken).CurrentValues.SetValues(token);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RevokeTokenAsync(string token, string ipAddress, string replacementToken = null)
        {
            var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            
            if (refreshToken == null) return false;

            // Revoke token and save
            refreshToken.Revoked = true;
            refreshToken.ReplacedByToken = replacementToken;

            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}