using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Entity to track applied database migrations
    /// </summary>
    [Table("MigrationHistory")]
    public class MigrationHistory
    {
        /// <summary>
        /// Unique identifier of the migration
        /// </summary>
        [Key]
        [Column("Id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Description of what the migration does
        /// </summary>
        [Column("Description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// When the migration was applied
        /// </summary>
        [Column("AppliedAt")]
        public DateTime AppliedAt { get; set; }
    }
}