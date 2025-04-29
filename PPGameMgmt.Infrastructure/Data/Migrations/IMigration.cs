using System;
using System.Threading.Tasks;

namespace PPGameMgmt.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Interface for database migrations
    /// </summary>
    public interface IMigration
    {
        /// <summary>
        /// Gets the unique identifier for the migration
        /// </summary>
        string Id { get; }
        
        /// <summary>
        /// Gets the description of what the migration does
        /// </summary>
        string Description { get; }
        
        /// <summary>
        /// Gets the timestamp when the migration was created
        /// </summary>
        DateTime CreatedAt { get; }
        
        /// <summary>
        /// Applies the migration to the database
        /// </summary>
        Task ApplyAsync();
        
        /// <summary>
        /// Reverts the migration from the database
        /// </summary>
        Task RevertAsync();
    }
}