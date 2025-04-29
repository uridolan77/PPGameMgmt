using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class BonusRepository : Repository<object>, IBonusRepository
    {
        public BonusRepository(CasinoDbContext context, ILogger<BonusRepository> logger = null)
            : base(context, logger)
        {
        }

        public async Task<object> GetByIdAsync(Guid id)
        {
            // Implementation to match IRepository<T> interface
            return await base.GetByIdAsync(id.ToString());
        }

        public async Task<IReadOnlyList<object>> ListAllAsync()
        {
            var results = await base.GetAllAsync();
            return results.ToList().AsReadOnly();
        }

        public async Task<IReadOnlyList<object>> ListAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.ToList().AsReadOnly();
        }

        public async Task<object> AddAsync(object entity)
        {
            await base.AddAsync(entity);
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await base.DeleteAsync(entity);
            }
        }

        public async Task<int> CountAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.Count();
        }
    }

    public class GameSessionRepository : Repository<object>, IGameSessionRepository
    {
        public GameSessionRepository(CasinoDbContext context, ILogger<GameSessionRepository> logger = null)
            : base(context, logger)
        {
        }

        public async Task<object> GetByIdAsync(Guid id)
        {
            return await base.GetByIdAsync(id.ToString());
        }

        public async Task<IReadOnlyList<object>> ListAllAsync()
        {
            var results = await base.GetAllAsync();
            return results.ToList().AsReadOnly();
        }

        public async Task<IReadOnlyList<object>> ListAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.ToList().AsReadOnly();
        }

        public async Task<object> AddAsync(object entity)
        {
            await base.AddAsync(entity);
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await base.DeleteAsync(entity);
            }
        }

        public async Task<int> CountAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.Count();
        }
    }

    public class RecommendationRepository : Repository<object>, IRecommendationRepository
    {
        public RecommendationRepository(CasinoDbContext context, ILogger<RecommendationRepository> logger = null)
            : base(context, logger)
        {
        }

        public async Task<object> GetByIdAsync(Guid id)
        {
            return await base.GetByIdAsync(id.ToString());
        }

        public async Task<IReadOnlyList<object>> ListAllAsync()
        {
            var results = await base.GetAllAsync();
            return results.ToList().AsReadOnly();
        }

        public async Task<IReadOnlyList<object>> ListAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.ToList().AsReadOnly();
        }

        public async Task<object> AddAsync(object entity)
        {
            await base.AddAsync(entity);
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await base.DeleteAsync(entity);
            }
        }

        public async Task<int> CountAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.Count();
        }
    }

    public class PlayerFeaturesRepository : Repository<object>, IPlayerFeaturesRepository
    {
        public PlayerFeaturesRepository(CasinoDbContext context, ILogger<PlayerFeaturesRepository> logger = null)
            : base(context, logger)
        {
        }

        public async Task<object> GetByIdAsync(Guid id)
        {
            return await base.GetByIdAsync(id.ToString());
        }

        public async Task<IReadOnlyList<object>> ListAllAsync()
        {
            var results = await base.GetAllAsync();
            return results.ToList().AsReadOnly();
        }

        public async Task<IReadOnlyList<object>> ListAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.ToList().AsReadOnly();
        }

        public async Task<object> AddAsync(object entity)
        {
            await base.AddAsync(entity);
            return entity;
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await base.DeleteAsync(entity);
            }
        }

        public async Task<int> CountAsync(Expression<Func<object, bool>> predicate)
        {
            var results = await base.FindAsync(predicate);
            return results.Count();
        }
    }

}