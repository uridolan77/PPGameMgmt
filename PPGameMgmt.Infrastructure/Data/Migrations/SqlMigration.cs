using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Base SQL migration class that executes SQL scripts
    /// </summary>
    public abstract class SqlMigration : IMigration
    {
        protected readonly CasinoDbContext _dbContext;
        protected readonly ILogger _logger;
        
        public abstract string Id { get; }
        public abstract string Description { get; }
        public DateTime CreatedAt { get; }
        
        protected abstract string UpSql { get; }
        protected abstract string DownSql { get; }
        
        protected SqlMigration(CasinoDbContext dbContext, ILogger logger = null)
        {
            _dbContext = dbContext;
            _logger = logger;
            CreatedAt = GetCreationDateFromId();
        }
        
        public async Task ApplyAsync()
        {
            _logger?.LogInformation("Applying migration {Id}: {Description}", Id, Description);
            
            if (string.IsNullOrWhiteSpace(UpSql))
            {
                throw new InvalidOperationException($"Migration {Id} doesn't have an Up SQL script");
            }
            
            await _dbContext.Database.ExecuteSqlRawAsync(UpSql);
            
            _logger?.LogInformation("Successfully applied migration {Id}", Id);
        }
        
        public async Task RevertAsync()
        {
            _logger?.LogInformation("Reverting migration {Id}: {Description}", Id, Description);
            
            if (string.IsNullOrWhiteSpace(DownSql))
            {
                throw new InvalidOperationException($"Migration {Id} doesn't have a Down SQL script");
            }
            
            await _dbContext.Database.ExecuteSqlRawAsync(DownSql);
            
            _logger?.LogInformation("Successfully reverted migration {Id}", Id);
        }
        
        /// <summary>
        /// Extracts creation date from the migration ID
        /// Assumes migration IDs follow the format YYYYMMDDHHMMSS_Description
        /// </summary>
        private DateTime GetCreationDateFromId()
        {
            try
            {
                // Extract the timestamp portion (first 14 characters)
                if (Id.Length < 14 || !Id.Contains('_'))
                {
                    return DateTime.MinValue;
                }
                
                string timestamp = Id.Substring(0, 14);
                
                int year = int.Parse(timestamp.Substring(0, 4));
                int month = int.Parse(timestamp.Substring(4, 2));
                int day = int.Parse(timestamp.Substring(6, 2));
                int hour = int.Parse(timestamp.Substring(8, 2));
                int minute = int.Parse(timestamp.Substring(10, 2));
                int second = int.Parse(timestamp.Substring(12, 2));
                
                return new DateTime(year, month, day, hour, minute, second);
            }
            catch
            {
                // If we can't parse the ID, return a default timestamp
                return DateTime.MinValue;
            }
        }
    }
}