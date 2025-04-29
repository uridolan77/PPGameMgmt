using System;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Entity to track applied database migrations
    /// </summary>
    public class MigrationHistory
    {
        /// <summary>
        /// Unique identifier of the migration
        /// </summary>
        public string Id { get; set; }
        
        /// <summary>
        /// Description of what the migration does
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// When the migration was applied
        /// </summary>
        public DateTime AppliedAt { get; set; }
    }
}